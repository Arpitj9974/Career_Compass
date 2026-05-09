import { create } from 'zustand';
import api from '../services/api';
import { computeChildPositions } from '../utils/positionUtils';

/**
 * BFS helper — returns all descendant ids of startId using edgeMap.
 * Never uses recursion. Safe at any depth.
 * @param {string} startId
 * @param {Map<string, string[]>} edgeMap
 * @returns {string[]}
 */
function getDescendantIds(startId, edgeMap) {
    const result = [];
    const queue = [startId];
    while (queue.length > 0) {
        const current = queue.shift();
        const children = edgeMap.get(current) || [];
        for (const childId of children) {
            result.push(childId);
            queue.push(childId);
        }
    }
    return result;
}

/**
 * Zustand store for Career Compass state management
 */
export const useCareerStore = create((set, get) => ({
    // ─────────────────────────────────────────────────────────────
    // AUTH STATE — DO NOT TOUCH
    // ─────────────────────────────────────────────────────────────
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    // ─────────────────────────────────────────────────────────────
    // FLAT TREE STATE (replaces nested decisionTree)
    // ─────────────────────────────────────────────────────────────

    /** Map<nodeId:string, nodeData:object> — every visible node on canvas */
    nodeMap: new Map(),

    /** Map<parentId:string, childIds:string[]> — which nodes are children of which parent */
    edgeMap: new Map(),

    /** Map<nodeId:string, {x:number, y:number}> — canvas position of every node */
    posMap: new Map(),

    /** Set<nodeId:string> — nodes whose children are currently visible */
    expandedIds: new Set(),

    /** string|null — the node the student last clicked */
    selectedId: null,

    /** Set<nodeId:string> — nodes waiting for API response */
    loadingIds: new Set(),

    /** string[] — nodes just added in the most recent expansion (for animation) */
    lastAddedIds: [],

    // ─────────────────────────────────────────────────────────────
    // Legacy / Profile State (keep intact — used by other components)
    // ─────────────────────────────────────────────────────────────
    trees: [],
    currentTree: null,
    studentProfile: {
        education_level: '12th',
        stream: 'Science',
        marks: { maths: 75, physics: 68, chemistry: 62, english: 80 },
        budget_min: 500000,
        budget_max: 1500000,
        interests: ['Technology', 'Programming', 'Problem Solving'],
        skills: ['Mathematics', 'Logic', 'Basic Coding'],
    },

    // UI state
    loading: false,
    error: null,

    // ─────────────────────────────────────────────────────────────
    // TREE ACTIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * initTree — called once when the app loads.
     * Receives an array of root node objects from the API.
     */
    initTree: (rootNodes) => {
        const centerNode = {
            id: 'root',
            title: 'Career Compass',
            icon: '🧭',
            level: 0,
            parentId: null,
            lazy: false,
        };

        const nodeMap = new Map();
        nodeMap.set('root', centerNode);

        const rootIds = [];
        for (const node of rootNodes) {
            const enriched = { ...node, parentId: 'root', level: 1, lazy: true };
            nodeMap.set(String(node.id), enriched);
            rootIds.push(String(node.id));
        }

        const edgeMap = new Map();
        edgeMap.set('root', rootIds);

        set({
            nodeMap,
            edgeMap,
            posMap: new Map(),
            expandedIds: new Set(),
            selectedId: null,
            loadingIds: new Set(),
            lastAddedIds: [],
        });
    },

    /**
     * setPositions — called by canvas after computing layout positions.
     * Receives a Map or plain object of nodeId → {x, y}.
     */
    setPositions: (positions) => {
        const { posMap } = get();
        const merged = new Map(posMap);
        const entries = positions instanceof Map
            ? positions.entries()
            : Object.entries(positions);
        for (const [id, pos] of entries) {
            merged.set(String(id), pos);
        }
        set({ posMap: merged });
    },

    /**
     * expandNode — called when student clicks expand on a node.
     */
    expandNode: async (nodeId) => {
        const id = String(nodeId);
        const { expandedIds, edgeMap, nodeMap, loadingIds } = get();

        // CASE 1: already expanded → collapse instead
        if (expandedIds.has(id)) {
            get().collapseNode(id);
            return;
        }

        // CASE 2: children already fetched (previously collapsed, now re-expanding)
        if (edgeMap.has(id)) {
            const newExpanded = new Set(expandedIds);
            newExpanded.add(id);
            set({ expandedIds: newExpanded, selectedId: id });
            return;
        }

        // CASE 3: first time — fetch from API
        const newLoadingIds = new Set(get().loadingIds);
        newLoadingIds.add(id);
        set({ loadingIds: newLoadingIds, selectedId: id });

        try {
            const response = await api.get(`/nodes/${id}/children`);
            const { nodes: children = [], edges: _ = [] } = response.data;

            if (!children || children.length === 0) {
                // No children — remove from loading only
                const updated = new Set(get().loadingIds);
                updated.delete(id);
                set({ loadingIds: updated });
                return;
            }

            // Always read fresh state after await to avoid stale closures
            const state = get();
            const parentNode = state.nodeMap.get(id);
            const parentLevel = parentNode ? (parentNode.level || 0) : 0;

            // Build new nodeMap entries
            const newNodeMap = new Map(state.nodeMap);
            const newChildIds = [];

            for (const child of children) {
                const childId = String(child.id);
                // Determine if node is a leaf (no further children to load)
                const isLazy = child.lazy !== undefined
                    ? child.lazy
                    : !(child.is_leaf === true || child.leaf === true || (child.children && child.children.length === 0 && child.lazy === false));

                const childNode = {
                    ...child,
                    id: childId,
                    parentId: id,
                    level: parentLevel + 1,
                    lazy: isLazy,
                };
                newNodeMap.set(childId, childNode);
                newChildIds.push(childId);
            }

            // Build new edgeMap entries
            const newEdgeMap = new Map(state.edgeMap);
            newEdgeMap.set(id, newChildIds);

            // Compute positions for new children
            const childPositions = computeChildPositions(id, children, state.posMap, newNodeMap);
            const newPosMap = new Map(state.posMap);
            for (const [childId, pos] of childPositions.entries()) {
                newPosMap.set(childId, pos);
            }

            // Build new expandedIds
            const newExpanded = new Set(state.expandedIds);
            newExpanded.add(id);

            // Remove from loadingIds
            const newLoading = new Set(state.loadingIds);
            newLoading.delete(id);

            // Call set() EXACTLY ONCE with everything together
            set({
                nodeMap: newNodeMap,
                edgeMap: newEdgeMap,
                posMap: newPosMap,
                expandedIds: newExpanded,
                loadingIds: newLoading,
                selectedId: id,
                lastAddedIds: newChildIds,
            });

            // Auto-clear lastAddedIds after 500ms
            setTimeout(() => {
                set({ lastAddedIds: [] });
            }, 500);

        } catch (error) {
            console.error('Error expanding node:', error);
            // On failure: only remove from loadingIds, keep all other state intact
            const updated = new Set(get().loadingIds);
            updated.delete(id);
            set({ loadingIds: updated });
        }
    },

    /**
     * collapseNode — called when student clicks an already-expanded node.
     */
    collapseNode: (nodeId) => {
        const id = String(nodeId);
        const state = get();

        // BFS to get all descendant ids
        const descendants = getDescendantIds(id, state.edgeMap);

        // Create new copies — never mutate Maps/Sets directly
        const newNodeMap = new Map(state.nodeMap);
        const newPosMap = new Map(state.posMap);
        const newEdgeMap = new Map(state.edgeMap);
        const newExpanded = new Set(state.expandedIds);

        // Remove all descendants
        for (const descId of descendants) {
            newNodeMap.delete(descId);
            newPosMap.delete(descId);
            newEdgeMap.delete(descId);
            newExpanded.delete(descId);
        }

        // Remove this node's own edge entry (so children re-fetch next time)
        newEdgeMap.delete(id);
        newExpanded.delete(id);

        // Clear selectedId if it was in the collapsed subtree
        const collapsedSet = new Set([id, ...descendants]);
        const newSelectedId = collapsedSet.has(state.selectedId) ? null : state.selectedId;

        set({
            nodeMap: newNodeMap,
            posMap: newPosMap,
            edgeMap: newEdgeMap,
            expandedIds: newExpanded,
            selectedId: newSelectedId,
            lastAddedIds: [],
        });
    },

    /**
     * selectNode — called when student clicks the body of a node.
     */
    selectNode: (nodeId) => {
        set({ selectedId: String(nodeId) });
    },

    /**
     * resetTree — clears everything back to empty start values.
     */
    resetTree: () => {
        set({
            nodeMap: new Map(),
            edgeMap: new Map(),
            posMap: new Map(),
            expandedIds: new Set(),
            selectedId: null,
            loadingIds: new Set(),
            lastAddedIds: [],
        });
    },

    // ─────────────────────────────────────────────────────────────
    // LEGACY TREE CRUD (kept for admin pages — do not remove)
    // ─────────────────────────────────────────────────────────────
    addTreeNode: (parentId) => {
        console.warn('addTreeNode: legacy action — tree is now flat Maps');
    },
    attachChildren: (nodeId, newChildren) => {
        console.warn('attachChildren: legacy action — use expandNode instead');
    },
    deleteTreeNode: (nodeId) => {
        console.warn('deleteTreeNode: legacy action — tree is now flat Maps');
    },
    updateTreeNode: (nodeId, data) => {
        console.warn('updateTreeNode: legacy action — tree is now flat Maps');
    },
    saveTreeToServer: async () => {
        console.warn('saveTreeToServer: legacy action');
        return { success: false };
    },

    // ─────────────────────────────────────────────────────────────
    // AUTH ACTIONS — COMPLETELY UNTOUCHED
    // ─────────────────────────────────────────────────────────────
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false, error: error.response?.data?.error || 'Login failed' });
            return { success: false, error: error.response?.data?.error };
        }
    },

    register: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/register', { email, password, name });
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false, error: error.response?.data?.error || 'Registration failed' });
            return { success: false, error: error.response?.data?.error };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    fetchUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data.user });
        } catch (error) {
            get().logout();
        }
    },

    // ─────────────────────────────────────────────────────────────
    // LEGACY TREE / PROFILE / PATH ACTIONS — UNTOUCHED
    // ─────────────────────────────────────────────────────────────
    fetchTrees: async () => {
        try {
            const response = await api.get('/trees');
            const trees = response.data.trees || [];
            set({ trees, currentTree: trees[0] || null });
            return trees;
        } catch (error) {
            console.error('Failed to load trees:', error);
            return [];
        }
    },

    setCurrentTree: (tree) => {
        set({ currentTree: tree });
    },

    fetchRootNodes: async (treeId) => {
        try {
            const response = await api.get(`/trees/${treeId}/root`);
            return response.data.nodes || [];
        } catch (error) {
            console.error('Error fetching root nodes:', error);
            return [];
        }
    },

    fetchChildren: async (nodeId, profile) => {
        try {
            const profileParam = profile ? encodeURIComponent(JSON.stringify(profile)) : '';
            const response = await api.get(`/nodes/${nodeId}/children?profile=${profileParam}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching children:', error);
            return { nodes: [], edges: [] };
        }
    },

    updateProfile: (profile) => {
        set({ studentProfile: { ...get().studentProfile, ...profile } });
    },

    saveProfileToServer: async () => {
        const profile = get().studentProfile;
        try {
            await api.post('/student/profile', profile);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error };
        }
    },

    savePath: async (treeId, pathNodes, notes) => {
        try {
            await api.post('/student/paths/save', {
                tree_id: treeId,
                path_nodes: pathNodes,
                notes,
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error };
        }
    },

    fetchSavedPaths: async () => {
        try {
            const response = await api.get('/student/paths/saved');
            return response.data.paths;
        } catch (error) {
            console.error('Error fetching saved paths:', error);
            return [];
        }
    },
}));

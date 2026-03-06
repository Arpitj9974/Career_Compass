import { create } from 'zustand';
import api from '../services/api';

/**
 * Zustand store for Career Compass state management
 */
export const useCareerStore = create((set, get) => ({
    // Auth state
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    // --- DECISION ENGINE (The JSON-First Tree) ---
    // HARD RESET: Complete backbone structure to fix tree corruption
    decisionTree: {
        id: 'root',
        title: 'Career Explorer',
        label: 'Career Explorer',
        level: 0,
        children: [
            {
                id: 'after_10th',
                title: 'After 10th',
                label: 'After 10th',
                level: 1,
                children: [
                    {
                        id: '10_engineering',
                        title: 'Engineering',
                        label: '⚙️ Engineering',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_medical_healthcare',
                        title: 'Medical & Healthcare',
                        label: '🏥 Medical & Healthcare',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_commerce',
                        title: 'Commerce & Business',
                        label: '💼 Commerce & Business',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_arts',
                        title: 'Arts & Humanities',
                        label: '🎨 Arts & Humanities',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_science',
                        title: 'Science (Non-Medical)',
                        label: '🔬 Science (Non-Medical)',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_design',
                        title: 'Design & Creative',
                        label: '✨ Design & Creative',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_aviation',
                        title: 'Aviation & Aerospace',
                        label: '✈️ Aviation & Aerospace',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_defense',
                        title: 'Defense & Uniformed Services',
                        label: '🎖️ Defense & Uniformed Services',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_sports',
                        title: 'Sports & Fitness',
                        label: '⚽ Sports & Fitness',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_vocational',
                        title: 'Vocational & Skill Training',
                        label: '🔧 Vocational & Skill Training',
                        level: 2,
                        lazy: true,
                        children: []
                    },
                    {
                        id: '10_government',
                        title: 'Government Competitive Exams',
                        label: '📝 Government Competitive Exams',
                        level: 2,
                        lazy: true,
                        children: []
                    }
                ]
            },
            {
                id: 'after_12th',
                title: 'After 12th',
                label: 'After 12th',
                level: 1,
                children: [
                    { id: '12_eng', title: 'Engineering', label: 'Engineering', level: 2, children: [] },
                    { id: '12_med', title: 'Medical', label: 'Medical', level: 2, children: [] },
                    { id: '12_com', title: 'Commerce', label: 'Commerce', level: 2, children: [] },
                    { id: '12_arts', title: 'Arts / Humanities', label: 'Arts / Humanities', level: 2, children: [] },
                    { id: '12_sci', title: 'Science (Non-Med)', label: 'Science (Non-Med)', level: 2, children: [] },
                    { id: '12_design', title: 'Design & Creative', label: 'Design & Creative', level: 2, children: [] },
                    { id: '12_avi', title: 'Aviation', label: 'Aviation', level: 2, children: [] },
                    { id: '12_def', title: 'Defense', label: 'Defense', level: 2, children: [] },
                    { id: '12_agri', title: 'Agriculture', label: 'Agriculture', level: 2, children: [] },
                    { id: '12_skill', title: 'Skill / Vocational', label: 'Skill / Vocational', level: 2, children: [] },
                    { id: '12_gov', title: 'Government Jobs', label: 'Government Jobs', level: 2, children: [] }
                ]
            },
            {
                id: 'career_switch',
                title: 'Career Switch',
                label: 'Career Switch',
                level: 1,
                children: []
            },
            {
                id: 'skill_based',
                title: 'Skill Based',
                label: 'Skill Based',
                level: 1,
                children: []
            }
        ]
    },

    // Legacy Tree & Profile State (Required for Explorer)
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

    // Recursive CRUD Utilities
    addTreeNode: (parentId) => {
        const addItem = (node) => {
            if (node.id === parentId) {
                return {
                    ...node,
                    children: [
                        ...(node.children || []),
                        {
                            id: `node_${Date.now()}`,
                            title: 'New Path',
                            level: node.level + 1,
                            children: []
                        }
                    ]
                };
            }
            return {
                ...node,
                children: node.children?.map(addItem) || []
            };
        };
        set({ decisionTree: addItem(get().decisionTree) });
    },

    // IMPORTANT: Lazy Load Attachment Logic
    // Merges new children into the existing tree structure without replacing the root.
    attachChildren: (nodeId, newChildren) => {
        const attach = (node) => {
            if (node.id === nodeId) {
                // Determine level based on parent
                const childLevel = (node.level || 0) + 1;

                // Map new children to ensure they have correct structure
                const processedChildren = newChildren.map(child => ({
                    ...child,
                    level: childLevel,
                    // If the child from JSON says it's lazy, keep it, otherwise default false
                    lazy: child.lazy || false,
                    children: child.children || []
                }));

                return {
                    ...node,
                    lazy: false, // Node is no longer lazy as we loaded children
                    children: processedChildren
                };
            }
            // Recurse
            return {
                ...node,
                children: node.children?.map(attach) || []
            };
        };

        // Atomic update of the Master Tree
        set({ decisionTree: attach(get().decisionTree) });
    },

    deleteTreeNode: (nodeId) => {
        const removeItem = (node) => {
            return {
                ...node,
                children: node.children
                    ?.filter(child => child.id !== nodeId)
                    .map(removeItem) || []
            };
        };
        // Prevention: Can't delete the root
        if (nodeId === get().decisionTree.id) return;
        set({ decisionTree: removeItem(get().decisionTree) });
    },

    updateTreeNode: (nodeId, data) => {
        const updateItem = (node) => {
            if (node.id === nodeId) {
                return { ...node, ...data };
            }
            return {
                ...node,
                children: node.children?.map(updateItem) || []
            };
        };
        set({ decisionTree: updateItem(get().decisionTree) });
    },

    saveTreeToServer: async () => {
        set({ loading: true });
        try {
            await api.post('/admin/tree/save', { tree: get().decisionTree });
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, error: 'Failed to save tree' };
        }
    },

    // UI state
    loading: false,
    error: null,

    // Auth actions
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

    // Fetch current user
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

    // Tree actions
    fetchTrees: async () => {
        try {
            // For now, we ignore the server trees and return our Master Tree wrapper
            // This ensures the Selector shows our local 'Career Explorer'
            const masterTree = get().decisionTree;
            const trees = [{
                id: masterTree.id,
                name: masterTree.title,
                ...masterTree
            }];

            set({
                trees,
                currentTree: trees[0]
            });
            return trees;
        } catch (error) {
            console.error('Failed to load trees:', error);
            return [];
        }
    },

    setCurrentTree: (tree) => {
        set({ currentTree: tree });
    },

    // Node actions
    fetchRootNodes: async (treeId) => {
        // Always return the Master Tree root(s)
        // If the requested treeId matches our master tree, return its children (or the root itself?)
        // NotebookCanvas expets an array of root nodes.
        const masterTree = get().decisionTree;
        return [masterTree];
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

    // Profile actions
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

    // Saved paths actions
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

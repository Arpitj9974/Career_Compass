import { useState, useCallback, useEffect, useRef } from 'react';
import CanvasNode from './CanvasCard';
import InfiniteCanvas, { useCamera } from './InfiniteCanvas';
import MiniMap from './MiniMap';
import { useCareerStore } from '../../context/careerStore';

/**
 * NotebookContent - Visual Layer
 * Renders Edges and Nodes based on computed layout
 */
const AnimatedNode = ({ item, layout, isExpanded, handleNodeToggle, items, onMeasure, isInActivePath, isFaded, isHidden }) => {
    const targetPos = layout[item.id] || { x: 0, y: 0 };
    const nodeRef = useRef(null);

    // Find parent position for initial "Inside-Out" animation
    const parentItem = items.find(i => i.id === item.parentId);
    const parentPos = parentItem && layout[parentItem.id]
        ? layout[parentItem.id]
        : targetPos;

    // Initial State: Start at Parent (if exists), else Target
    const [style, setStyle] = useState(() => ({
        top: parentPos.y,
        left: parentPos.x,
        opacity: 0,
        transform: 'scale(0.5)',
    }));

    useEffect(() => {
        const timer = requestAnimationFrame(() => {
            setStyle({
                top: targetPos.y,
                left: targetPos.x,
                opacity: 1,
                transform: 'scale(1)',
            });
        });
        return () => cancelAnimationFrame(timer);
    }, [targetPos.x, targetPos.y]);

    // MEASURE WIDTH DYNAMICALLY
    useEffect(() => {
        if (!nodeRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                onMeasure(item.id, entry.contentRect.width);
            }
        });
        observer.observe(nodeRef.current);
        return () => observer.disconnect();
    }, [item.id, onMeasure]);

    return (
        <div
            ref={nodeRef}
            className={`decision-node ${isExpanded ? 'active expanded' : ''} ${isInActivePath ? 'active-path' : ''} ${isFaded ? 'faded-node' : ''} ${isHidden ? 'hidden-node' : ''}`}
            style={{
                position: 'absolute',
                top: style.top,
                left: style.left,
                opacity: style.opacity,
                transform: style.transform,
                transition: 'all 600ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                zIndex: isExpanded || isInActivePath ? 1000 : 100
            }}
        >
            <CanvasNode
                data={item.data}
                level={item.level}
                onExpand={() => handleNodeToggle(item)}
                isExpanded={isExpanded}
            />
        </div>
    );
};

// Helper: Edge Anchor Calculation (DYNAMIC WIDTHS)
const getAnchor = (item, pos, nodeWidthMap) => {
    const level = Number(item.level);
    const measuredWidth = nodeWidthMap[item.id];

    let width = measuredWidth || (level === 0 ? 210 : (level === 1 ? 170 : 140));
    let height = 30;

    if (level === 0) { height = 48; }
    else if (level === 1) { height = 38; }
    else { height = 30; }

    return {
        x: pos.x + width + 12, // +12px offset for "plugged-in" look
        y: pos.y + (height / 2)
    };
};

// Helper: Compute dynamic SVG bounds from all layout positions
const computeSvgBounds = (items, layout) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    items.forEach(item => {
        const pos = layout[item.id];
        if (pos) {
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + 500); // Pad for wide nodes
            maxY = Math.max(maxY, pos.y + 100);
        }
    });
    if (minX === Infinity) return { x: 0, y: 0, width: 2000, height: 2000 };
    const pad = 400;
    return {
        x: minX - pad,
        y: minY - pad,
        width: (maxX - minX) + pad * 2,
        height: (maxY - minY) + pad * 2,
    };
};

const NotebookContent = ({ items, layout, expandedNodes, handleNodeToggle, ripples, nodeWidthMap, activePathIds, focusMode, focusedNode, onMeasure }) => {
    const svgBounds = computeSvgBounds(items, layout);

    return (
        <>
            {ripples.map(r => (
                <div
                    key={r.id}
                    className="ripple"
                    style={{ left: r.x, top: r.y }}
                />
            ))}

            <svg
                style={{
                    position: 'absolute',
                    left: svgBounds.x,
                    top: svgBounds.y,
                    width: svgBounds.width,
                    height: svgBounds.height,
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 0, // Force connections to the back
                }}
                viewBox={`${svgBounds.x} ${svgBounds.y} ${svgBounds.width} ${svgBounds.height}`}
            >
                {items.map(item => {
                    if (!expandedNodes.has(item.id)) return null;

                    const itemPos = layout[item.id];
                    if (!itemPos) return null;
                    const start = getAnchor(item, itemPos, nodeWidthMap);

                    const children = items.filter(child => child.parentId === item.id);
                    if (children.length === 0) return null;

                    const isParentInPath = activePathIds.has(item.id);

                    return children.map(child => {
                        const childPos = layout[child.id];
                        if (!childPos) return null;

                        const level = Number(child.level);
                        const cHeight = level === 0 ? 48 : (level === 1 ? 38 : 30);
                        const end = {
                            x: childPos.x,
                            y: childPos.y + (cHeight / 2)
                        };

                        const isInPath = isParentInPath && activePathIds.has(child.id);
                        const isFaded = focusMode && !isInPath;

                        const dx = Math.max(80, (end.x - start.x) * 0.6);
                        const d = `
                            M ${start.x} ${start.y}
                            C ${start.x + dx} ${start.y},
                              ${end.x - dx} ${end.y},
                              ${end.x} ${end.y}
                        `;

                        return (
                            <g key={`edge-${item.id}-${child.id}`} style={{ opacity: isFaded ? 0.1 : 0.8 }}>
                                <path d={d} className={`edge-glow ${isInPath ? 'active-path-edge' : ''}`} />
                                <path d={d} className="edge" />
                            </g>
                        );
                    });
                })}
            </svg>

            {items.map(item => {
                if (!layout[item.id]) return null;
                const isExpanded = expandedNodes.has(item.id);
                const isInActivePath = activePathIds.has(item.id);

                // Focus Mode Logic: Fade at Level 2, Hide at Level 3+
                const isFaded = focusMode && !isInActivePath;

                // Zoom Focus: If we are deep (level 3+) and node is NOT in path, hide it completely
                const isDeepFocus = focusMode && (focusedNode && focusedNode.level >= 3);
                const isHidden = isDeepFocus && !isInActivePath;

                return (
                    <AnimatedNode
                        key={item.id}
                        item={item}
                        layout={layout}
                        isExpanded={isExpanded}
                        handleNodeToggle={handleNodeToggle}
                        items={items}
                        onMeasure={onMeasure}
                        isInActivePath={isInActivePath}
                        isFaded={isFaded && !isHidden}
                        isHidden={isHidden}
                    />
                );
            })}
        </>
    );
};

/**
 * Breadcrumbs Component
 */
const Breadcrumbs = ({ items, focusedNodeId, onNavigate, focusMode, onExitFocus }) => {
    if (!focusedNodeId) return null;

    const path = [];
    let currentId = focusedNodeId;

    while (currentId) {
        const node = items.find(i => i.id === currentId);
        if (node) {
            path.unshift(node);
            currentId = node.parentId;
        } else { break; }
    }

    if (path.length === 0) return null;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-sm text-gray-300 shadow-xl">
                {path.map((node, index) => (
                    <div key={node.id} className="flex items-center gap-2">
                        {index > 0 && <span className="opacity-40">›</span>}
                        <button
                            onClick={() => onNavigate(node)}
                            className={`hover:text-white transition-colors outline-none ${index === path.length - 1 ? 'text-white font-medium' : ''}`}
                        >
                            {node.data.name || node.data.label || node.data.title}
                        </button>
                    </div>
                ))}
            </div>

            {focusMode && (
                <button
                    onClick={onExitFocus}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-xs font-bold rounded-full border border-red-500/30 transition-all active:scale-95 shadow-lg"
                >
                    EXIT FOCUS [ESC]
                </button>
            )}
        </div>
    );
};

const CameraController = ({ targetCamera, focusMode, lastFocusedNodeId }) => {
    const { setView, camera, containerRef } = useCamera();
    const lastFocusedIdRef = useRef(null);

    useEffect(() => {
        // Only run if we have a target and either the node changed OR focus mode toggled
        if (targetCamera && containerRef.current && (lastFocusedIdRef.current !== lastFocusedNodeId || focusMode)) {
            const { width, height } = containerRef.current.getBoundingClientRect();

            // Adjust zoom in focus mode? 
            let zoom = camera.z;
            if (focusMode && zoom < 1.0) zoom = 1.0;

            const targetX = (width / 2) - (targetCamera.x * zoom);
            const targetY = (height / 2) - (targetCamera.y * zoom);

            setView(targetX, targetY, zoom);
            lastFocusedIdRef.current = lastFocusedNodeId;
        }
    }, [targetCamera, focusMode, lastFocusedNodeId, setView, containerRef]); // Removed camera.z

    return null;
}

export default function NotebookCanvas({
    rootNodes,
    onFetchChildren,
    studentProfile,
    isLoading: globalLoading,
}) {
    const { decisionTree, attachChildren } = useCareerStore();
    const [items, setItems] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [lastFocusedNodeId, setLastFocusedNodeId] = useState(null);
    const [ripples, setRipples] = useState([]);
    const [nodeWidthMap, setNodeWidthMap] = useState({});
    const [isFocusSuppressed, setIsFocusSuppressed] = useState(false);

    const COLUMN_GAP = 350; // Increased for flexible widths
    const FAN_GAP = 60;

    const getHeight = (level) => {
        if (level === 0) return 48;
        if (level === 1) return 38;
        return 30;
    };

    // CALCULATE ACTIVE PATH
    const activePathIds = (() => {
        const path = new Set();
        let currentId = lastFocusedNodeId;
        while (currentId) {
            path.add(currentId);
            const node = items.find(i => i.id === currentId);
            currentId = node ? node.parentId : null;
        }
        return path;
    })();

    // AUTO FOCUS MODE: Trigger at level 2+
    const focusedNode = items.find(i => i.id === lastFocusedNodeId);
    const isDeepLevel = focusedNode && focusedNode.level >= 2;
    const focusMode = isDeepLevel && !isFocusSuppressed;

    // ESC Key to exit focus
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsFocusSuppressed(true);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Re-enable focus if we navigate to a NEW deep node after suppression? 
    // Usually, navigating to a new node should re-trigger focus if it's deep.
    useEffect(() => {
        if (isDeepLevel) {
            setIsFocusSuppressed(false);
        }
    }, [lastFocusedNodeId]); // Re-enable on navigation

    const onMeasure = useCallback((id, width) => {
        setNodeWidthMap(prev => {
            if (prev[id] === width) return prev;
            return { ...prev, [id]: width };
        });
    }, []);

    useEffect(() => {
        if (rootNodes && rootNodes.length > 0 && items.length === 0) {
            const initialItems = rootNodes.map(node => ({
                id: String(node.id),
                level: 0,
                parentId: null,
                data: node,
                isVisible: true,
            }));
            setItems(initialItems);
        }
    }, [rootNodes]);

    const computeLayout = useCallback(() => {
        const positions = {};
        const itemsMap = new Map(items.map(i => [i.id, i]));



        const assignPositions = () => {
            const root = items.find(i => i.level === 0);
            if (!root) return;

            // 1. Build Adjacency Map for fast lookup
            const childrenMap = new Map();
            items.forEach(item => {
                if (!childrenMap.has(item.parentId)) childrenMap.set(item.parentId, []);
                childrenMap.get(item.parentId).push(item);
            });

            // 2. Post-Order Traversal to assign Y positions
            // Leaf nodes get sequential Ys. Parents get centered on children.
            let currentLeafY = 0;

            const traverse = (nodeId) => {
                const isExpanded = expandedNodes.has(nodeId);
                const children = childrenMap.get(nodeId) || [];

                if (!isExpanded || children.length === 0) {
                    // It's a visual leaf (either no children or collapsed)
                    const selfH = getHeight(itemsMap.get(nodeId).level);
                    const y = currentLeafY;
                    positions[nodeId] = { x: 0, y }; // X assigned later based on level
                    currentLeafY += selfH + FAN_GAP;
                    return { minY: y, maxY: y + selfH };
                }

                // Process all children first
                let minChildY = Infinity;
                let maxChildY = -Infinity;

                children.forEach(child => {
                    const bounds = traverse(child.id);
                    minChildY = Math.min(minChildY, bounds.minY);
                    maxChildY = Math.max(maxChildY, bounds.maxY);
                });

                // Parent is centered relative to its children's total span
                const selfH = getHeight(itemsMap.get(nodeId).level);
                const childrenCenter = (minChildY + maxChildY) / 2;
                const y = childrenCenter - (selfH / 2);

                positions[nodeId] = { x: 0, y };
                return { minY: minChildY, maxY: maxChildY };
            };

            traverse(root.id);

            // 3. Assign X positions based on level
            items.forEach(item => {
                if (positions[item.id]) {
                    positions[item.id].x = 100 + (item.level * COLUMN_GAP);
                }
            });
        };

        assignPositions();

        // Normalize: shift all positions so nothing is in negative space
        let globalMinX = Infinity, globalMinY = Infinity;
        Object.values(positions).forEach(pos => {
            globalMinX = Math.min(globalMinX, pos.x);
            globalMinY = Math.min(globalMinY, pos.y);
        });

        const offsetX = globalMinX < 50 ? (50 - globalMinX) : 0;
        const offsetY = globalMinY < 50 ? (50 - globalMinY) : 0;

        if (offsetX > 0 || offsetY > 0) {
            Object.keys(positions).forEach(key => {
                positions[key] = {
                    x: positions[key].x + offsetX,
                    y: positions[key].y + offsetY,
                };
            });
        }

        let targetCamera = null;
        if (lastFocusedNodeId && positions[lastFocusedNodeId]) {
            targetCamera = positions[lastFocusedNodeId];
        }

        return { positions, targetCamera };

    }, [items, expandedNodes, lastFocusedNodeId, COLUMN_GAP, FAN_GAP]);

    const { positions: layout, targetCamera } = computeLayout();

    const handleNodeToggle = async (node) => {
        const isExpanded = expandedNodes.has(node.id);

        if (isExpanded) {
            // Collapse Logic
            const descendants = new Set();
            const queue = [node.id];
            while (queue.length > 0) {
                const pid = queue.shift();
                const children = items.filter(i => i.parentId === pid);
                children.forEach(c => { descendants.add(c.id); queue.push(c.id); });
            }
            const newExpanded = new Set(expandedNodes);
            newExpanded.delete(node.id);
            descendants.forEach(id => newExpanded.delete(id));
            setExpandedNodes(newExpanded);
            setItems(prev => prev.filter(i => !descendants.has(i.id)));
            return;
        }

        // Ripple Effect
        const pos = layout[node.id];
        if (pos) {
            const rippleId = Date.now();
            setRipples(prev => [...prev, { id: rippleId, x: pos.x, y: pos.y }]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== rippleId));
            }, 1200);
        }

        // --- SMART NAVIGATION (SPACE SAVER) ---
        // Close ALL nodes that are not ancestors of this node
        const path = new Set();
        let curr = node;
        while (curr) { path.add(curr.id); curr = items.find(i => i.id === curr.parentId); }

        const nodesToClose = new Set();
        expandedNodes.forEach(id => {
            if (!path.has(id)) nodesToClose.add(id);
        });

        const newExpanded = new Set(expandedNodes);
        nodesToClose.forEach(id => newExpanded.delete(id));
        newExpanded.add(node.id);

        setExpandedNodes(newExpanded);
        setLastFocusedNodeId(node.id);

        if (nodesToClose.size > 0) {
            setItems(prev => prev.filter(i => {
                // Keep if it's in the path or is a direct root
                if (path.has(i.id)) return true;
                // Close if it was expanded but now isn't
                return !nodesToClose.has(i.id);
            }));
        }

        // Fetch Logic
        const findNodeInTree = (nodeId, root) => {
            if (root.id === nodeId) return root;
            if (!root.children) return null;
            for (let child of root.children) {
                const found = findNodeInTree(nodeId, child);
                if (found) return found;
            }
            return null;
        };

        const treeNode = findNodeInTree(node.id, decisionTree);

        if (treeNode && treeNode.children && treeNode.children.length > 0) {
            const newItems = treeNode.children.map(child => ({
                id: String(child.id),
                level: (node.level || 0) + 1,
                parentId: node.id,
                data: child,
                isVisible: true
            }));
            setItems(prev => {
                const existingIds = new Set(prev.map(i => i.id));
                const filteredNew = newItems.filter(i => !existingIds.has(i.id));
                return [...prev, ...filteredNew];
            });
            return;
        }

        // Lazy Load Logic
        if (node.data.lazy) {
            try {
                const { fetchChildren } = useCareerStore.getState();
                const result = await fetchChildren(node.id, studentProfile);
                if (result.nodes && result.nodes.length > 0) {
                    attachChildren(node.id, result.nodes);
                    const newItems = result.nodes.map(child => ({
                        id: String(child.id),
                        level: (node.level || 0) + 1,
                        parentId: node.id,
                        data: {
                            ...child,
                            level: (node.level || 0) + 1,
                            lazy: child.lazy || false,
                            children: child.children || []
                        },
                        isVisible: true
                    }));
                    setItems(prev => {
                        const existingIds = new Set(prev.map(i => i.id));
                        const filteredNew = newItems.filter(i => !existingIds.has(i.id));
                        return [...prev, ...filteredNew];
                    });
                    return;
                }
            } catch (err) { console.error(err); }
        }

        // Final fallback: onFetchChildren
        try {
            const result = await onFetchChildren(Number(node.id), studentProfile);
            if (result.nodes && result.nodes.length > 0) {
                const newItems = result.nodes.map(child => ({
                    id: String(child.id),
                    level: (node.level || 0) + 1,
                    parentId: node.id,
                    data: child,
                    isVisible: true
                }));
                setItems(prev => {
                    const existingIds = new Set(prev.map(i => i.id));
                    const filteredNew = newItems.filter(i => !existingIds.has(i.id));
                    return [...prev, ...filteredNew];
                });
            }
        } catch (err) { console.error(err); }
    };

    return (
        <InfiniteCanvas
            className="bg-[var(--canvas-bg)]"
            overlays={
                <>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-40">
                        <Breadcrumbs
                            items={items}
                            focusedNodeId={lastFocusedNodeId}
                            onNavigate={(node) => handleNodeToggle(node)}
                            focusMode={focusMode}
                            onExitFocus={() => setIsFocusSuppressed(true)}
                        />
                    </div>
                    <div className="absolute bottom-6 right-6 pointer-events-auto z-50">
                        <MiniMap items={items} layout={layout} />
                    </div>
                </>
            }
        >
            <NotebookContent
                items={items}
                layout={layout}
                expandedNodes={expandedNodes}
                handleNodeToggle={handleNodeToggle}
                ripples={ripples}
                nodeWidthMap={nodeWidthMap}
                activePathIds={activePathIds}
                focusMode={focusMode}
                focusedNode={focusedNode}
                onMeasure={onMeasure}
            />
            <CameraController targetCamera={targetCamera} focusMode={focusMode} lastFocusedNodeId={lastFocusedNodeId} />
            {globalLoading && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none">
                    Loading...
                </div>
            )}
        </InfiniteCanvas>
    );
}

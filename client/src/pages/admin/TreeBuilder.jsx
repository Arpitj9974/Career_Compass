import { useState, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

/**
 * Visual Tree Builder for Admins
 * Drag-and-drop decision tree editor
 */
export default function TreeBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [allNodes, setAllNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [trees, setTrees] = useState([]);
    const [currentTree, setCurrentTree] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [nodesRes, treesRes] = await Promise.all([
                api.get('/admin/nodes'),
                api.get('/trees')
            ]);
            setAllNodes(nodesRes.data.nodes || []);
            setTrees(treesRes.data.trees || []);

            if (treesRes.data.trees?.length > 0) {
                loadTree(treesRes.data.trees[0]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const loadTree = async (tree) => {
        setCurrentTree(tree);
        try {
            // Load root nodes and all their children for the tree
            const rootRes = await api.get(`/trees/${tree.id}/root`);
            const rootNodes = rootRes.data.nodes || [];

            // Build the visual tree
            const flowNodes = [];
            const flowEdges = [];
            const visited = new Set();

            const processNode = async (dbNode, x, y, parentId = null) => {
                if (visited.has(dbNode.id)) return;
                visited.add(dbNode.id);

                flowNodes.push({
                    id: String(dbNode.id),
                    type: 'default',
                    position: { x, y },
                    data: {
                        label: `${dbNode.icon || '📍'} ${dbNode.title}`,
                        ...dbNode
                    },
                    style: getNodeStyle(dbNode.node_type),
                });

                if (parentId) {
                    flowEdges.push({
                        id: `e${parentId}-${dbNode.id}`,
                        source: String(parentId),
                        target: String(dbNode.id),
                        animated: true,
                    });
                }
            };

            // Process root nodes
            rootNodes.forEach((node, i) => {
                processNode(node, 100, 100 + i * 150);
            });

            setNodes(flowNodes);
            setEdges(flowEdges);
        } catch (error) {
            console.error('Error loading tree:', error);
        }
    };

    const getNodeStyle = (nodeType) => {
        const styles = {
            goal: { background: '#4f46e5', color: 'white', border: '2px solid #6366f1', borderRadius: '12px', padding: '10px 15px' },
            path: { background: '#7c3aed', color: 'white', border: '2px solid #8b5cf6', borderRadius: '10px', padding: '8px 12px' },
            option: { background: '#0891b2', color: 'white', border: '2px solid #06b6d4', borderRadius: '10px', padding: '8px 12px' },
            outcome: { background: '#059669', color: 'white', border: '2px solid #10b981', borderRadius: '10px', padding: '8px 12px' },
        };
        return styles[nodeType] || styles.path;
    };

    const onConnect = useCallback(async (params) => {
        try {
            await api.post('/admin/edges', {
                parent_node_id: Number(params.source),
                child_node_id: Number(params.target),
            });
            setEdges((eds) => addEdge({ ...params, animated: true }, eds));
        } catch (error) {
            console.error('Error creating edge:', error);
            alert('Failed to connect nodes. Edge may already exist.');
        }
    }, []);

    const onNodeClick = (event, node) => {
        setSelectedNode(node.data);
    };

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const nodeId = event.dataTransfer.getData('application/nodeId');
        const node = allNodes.find(n => n.id === Number(nodeId));

        if (node) {
            const reactFlowBounds = event.target.getBoundingClientRect();
            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            setNodes((nds) => [
                ...nds,
                {
                    id: String(node.id),
                    type: 'default',
                    position,
                    data: { label: `${node.icon || '📍'} ${node.title}`, ...node },
                    style: getNodeStyle(node.node_type),
                }
            ]);
        }
    }, [allNodes]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDragStart = (event, node) => {
        event.dataTransfer.setData('application/nodeId', String(node.id));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-64px)] flex">
                {/* Left sidebar - Node palette */}
                <div className="w-72 bg-[var(--bg-secondary)] border-r border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-semibold text-white mb-2">Decision Trees</h3>
                        <select
                            value={currentTree?.id || ''}
                            onChange={(e) => {
                                const tree = trees.find(t => t.id === Number(e.target.value));
                                if (tree) loadTree(tree);
                            }}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                        >
                            {trees.map(tree => (
                                <option key={tree.id} value={tree.id}>{tree.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-semibold text-white mb-3">Node Palette</h3>
                        <p className="text-xs text-gray-500 mb-3">Drag nodes onto the canvas</p>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {allNodes.filter(n => !nodes.find(fn => fn.id === String(n.id))).slice(0, 20).map(node => (
                                <div
                                    key={node.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, node)}
                                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-move text-sm flex items-center gap-2"
                                >
                                    <span>{node.icon || '📍'}</span>
                                    <span className="text-white truncate">{node.title}</span>
                                    <span className="text-xs text-gray-500 ml-auto capitalize">
                                        {node.node_type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected node info */}
                    {selectedNode && (
                        <div className="p-4 flex-1 overflow-y-auto">
                            <h3 className="font-semibold text-white mb-3">Selected Node</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Title:</span>
                                    <p className="text-white">{selectedNode.title}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Type:</span>
                                    <p className="text-white capitalize">{selectedNode.node_type}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Status:</span>
                                    <p className="text-white capitalize">{selectedNode.status}</p>
                                </div>
                                {selectedNode.description && (
                                    <div>
                                        <span className="text-gray-500">Description:</span>
                                        <p className="text-gray-300 text-xs">{selectedNode.description}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 space-y-2">
                                <a
                                    href={`/admin/nodes?edit=${selectedNode.id}`}
                                    className="block w-full btn-secondary text-center text-sm py-2"
                                >
                                    ✏️ Edit Node
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Canvas */}
                <div className="flex-1">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color="#1a1a2e" gap={20} />
                        <Controls className="!bg-gray-800 !border-gray-700 !rounded-lg" />
                        <MiniMap
                            nodeColor={(node) => {
                                const type = node.data?.node_type;
                                const colors = { goal: '#4f46e5', path: '#7c3aed', option: '#0891b2', outcome: '#059669' };
                                return colors[type] || '#64748b';
                            }}
                            className="!bg-gray-900 !border-gray-700 !rounded-lg"
                        />

                        <Panel position="top-center" className="!m-4">
                            <div className="glass rounded-xl px-4 py-2">
                                <h2 className="text-lg font-semibold text-white">
                                    🌳 {currentTree?.name || 'Tree Builder'}
                                </h2>
                            </div>
                        </Panel>

                        <Panel position="top-right" className="!m-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => loadTree(currentTree)}
                                    className="btn-secondary text-sm py-2"
                                >
                                    🔄 Reload
                                </button>
                                <button className="btn-primary text-sm py-2">
                                    💾 Save Layout
                                </button>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </AdminLayout>
    );
}

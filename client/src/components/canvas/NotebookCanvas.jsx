import React, { useEffect, useMemo } from 'react';
import { ReactFlow, Background, MiniMap, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCareerStore } from '../../context/careerStore';
import { getInitialPositions } from '../../utils/positionUtils';
import { computeEdgePath, getNodeAnchorPoints } from '../../utils/layoutEngine';
import CareerPillNode from '../nodes/CareerPillNode';
import CareerEdge from '../edges/CareerEdge';
import CanvasControls from './CanvasControls';
import BreadcrumbTrail from './BreadcrumbTrail';
import CareerDetailPanel from './CareerDetailPanel';

// Register custom node and edge types outside component
const nodeTypes = {
    careerPillNode: CareerPillNode
};

const edgeTypes = {
    careerEdge: CareerEdge
};

function NotebookCanvasInner() {
    const {
        nodeMap,
        edgeMap,
        posMap,
        expandedIds,
        selectedId,
        loadingIds,
        lastAddedIds,
        expandNode,
        selectNode,
        initTree,
        setPositions,
        fetchRootNodes,
        currentTree
    } = useCareerStore();

    // ── ON MOUNT: Fetch Roots & Initialize ─────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const loadRoots = async () => {
            const treeId = currentTree?.id || 1;
            const roots = await fetchRootNodes(treeId);
            if (!mounted) return;

            initTree(roots);
            const initialPos = getInitialPositions();
            setPositions(initialPos);
        };
        loadRoots();

        return () => { mounted = false; };
    }, [currentTree, fetchRootNodes, initTree, setPositions]);

    // ── DERIVE REACT FLOW NODES ────────────────────────────────────────────────
    const nodes = useMemo(() => {
        const result = [];
        for (const [id, nodeData] of nodeMap.entries()) {
            const pos = posMap.get(id) || { x: 0, y: 0 };
            
            // Check if node has children
            const hasChildren = nodeData.lazy === true || (edgeMap.has(id) && edgeMap.get(id).length > 0);
            const childCount = edgeMap.has(id) ? edgeMap.get(id).length : 0;
            
            result.push({
                id: String(id),
                type: 'careerPillNode',
                position: pos,
                draggable: false,
                data: {
                    ...nodeData,
                    id: String(id),
                    isExpanded: expandedIds.has(id),
                    isSelected: selectedId === id,
                    isLoading: loadingIds.has(id),
                    isNew: lastAddedIds.includes(id),
                    hasChildren: hasChildren,
                    childCount: childCount,
                    onExpand: () => expandNode(id),
                    onSelect: () => selectNode(id),
                }
            });
        }
        return result;
    }, [nodeMap, posMap, expandedIds, selectedId, loadingIds, lastAddedIds, expandNode, selectNode, edgeMap]);

    // ── DERIVE REACT FLOW EDGES ────────────────────────────────────────────────
    const edges = useMemo(() => {
        const result = [];
        for (const [parentId, childIds] of edgeMap.entries()) {
            for (const childId of childIds) {
                const parentPos = posMap.get(parentId);
                const childPos = posMap.get(childId);
                
                if (!parentPos || !childPos) continue;

                const parentAnchors = getNodeAnchorPoints(parentId, parentPos);
                const childAnchors = getNodeAnchorPoints(childId, childPos);

                const { d } = computeEdgePath(parentAnchors.rightCenter, childAnchors.leftCenter);
                
                const isActive = selectedId === parentId || selectedId === childId;
                
                result.push({
                    id: `${parentId}-${childId}`,
                    source: String(parentId),
                    target: String(childId),
                    type: 'careerEdge',
                    data: { d },
                    style: {
                        stroke: isActive ? '#22c55e' : 'rgba(34, 197, 94, 0.25)',
                        strokeWidth: isActive ? 2 : 1.5,
                    }
                });
            }
        }
        return result;
    }, [edgeMap, posMap, selectedId]);

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <div className="w-full h-screen bg-[#060c06] overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView={true}
                fitViewOptions={{ padding: 0.4 }}
                nodesDraggable={false}
                nodesConnectable={false}
                panOnDrag={true}
                zoomOnScroll={true}
                minZoom={0.15}
                maxZoom={2.5}
                onNodesChange={() => {}} 
                onEdgesChange={() => {}}
            >
                <Background 
                    variant="dots"
                    color="rgba(34, 197, 94, 0.08)" 
                    gap={36} 
                    size={1} 
                />
                
                <CanvasControls />
                
                <MiniMap 
                    nodeColor="#0d1f0e"
                    maskColor="rgba(0, 0, 0, 0.4)"
                    className="bg-[#060c06] border border-green-900/40 rounded-lg overflow-hidden"
                />
            </ReactFlow>

            <BreadcrumbTrail />
            <CareerDetailPanel />
        </div>
    );
}

export default function NotebookCanvas(props) {
    return (
        <ReactFlowProvider>
            <NotebookCanvasInner {...props} />
        </ReactFlowProvider>
    );
}

import { useEffect, useMemo, memo } from 'react';
import { ReactFlow, Background, MiniMap, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCareerStore } from '../../context/careerStore';
import { getInitialPositions } from '../../utils/positionUtils';
import { CareerNodeWrapper } from './CanvasCard';
import CanvasControls from './CanvasControls';
import BreadcrumbTrail from './BreadcrumbTrail';
import CareerDetailPanel from './CareerDetailPanel';

const nodeTypes = {
    careerNode: CareerNodeWrapper,
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
            // Wait for currentTree or fallback to tree ID 1
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
            
            result.push({
                id: String(id),
                type: 'careerNode',
                position: pos,
                draggable: false,
                data: {
                    ...nodeData,
                    id: String(id),
                    isExpanded: expandedIds.has(id),
                    isSelected: selectedId === id,
                    isLoading: loadingIds.has(id),
                    isNew: lastAddedIds.includes(id),
                    onExpand: () => expandNode(id),
                    onSelect: () => selectNode(id),
                }
            });
        }
        return result;
    }, [nodeMap, posMap, expandedIds, selectedId, loadingIds, lastAddedIds, expandNode, selectNode]);

    // ── DERIVE REACT FLOW EDGES ────────────────────────────────────────────────
    const edges = useMemo(() => {
        const result = [];
        for (const [parentId, childIds] of edgeMap.entries()) {
            for (const childId of childIds) {
                const isActive = selectedId === parentId || selectedId === childId;
                
                result.push({
                    id: `${parentId}-${childId}`,
                    source: String(parentId),
                    target: String(childId),
                    type: 'smoothstep',
                    animated: false,
                    style: {
                        stroke: isActive ? '#22c55e' : 'rgba(34, 197, 94, 0.4)',
                        strokeWidth: isActive ? 2 : 1.2,
                    }
                });
            }
        }
        return result;
    }, [edgeMap, selectedId]);

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <div 
            className="relative w-full h-full"
            style={{
                backgroundColor: '#060c06',
                backgroundImage: 'radial-gradient(rgba(34, 197, 94, 0.08) 1px, transparent 1px)',
                backgroundSize: '36px 36px'
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                nodesDraggable={false}
                nodesConnectable={false}
                onNodesChange={() => {}} // silence warnings
                onEdgesChange={() => {}} // silence warnings
                minZoom={0.1}
                maxZoom={2}
            >
                <Background 
                    color="rgba(34, 197, 94, 0.2)" 
                    gap={36} 
                    size={1} 
                />
                
                <CanvasControls />
                <MiniMap 
                    nodeColor={(node) => {
                        if (node.data.isSelected) return '#22c55e';
                        if (node.data.level === 0) return '#064e3b';
                        return 'rgba(34, 197, 94, 0.4)';
                    }}
                    maskColor="rgba(6, 12, 6, 0.7)"
                    className="bg-[#060c06] border border-green-900/40 rounded-lg overflow-hidden"
                />
            </ReactFlow>

            <BreadcrumbTrail />
            <CareerDetailPanel />
        </div>
    );
}

// Wrap with ReactFlowProvider so we can use useReactFlow inside (if not already wrapped at page level)
import { ReactFlowProvider } from '@xyflow/react';

export default function NotebookCanvas(props) {
    return (
        <ReactFlowProvider>
            <NotebookCanvasInner {...props} />
        </ReactFlowProvider>
    );
}

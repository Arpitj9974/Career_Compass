import { useCallback, useEffect, useState } from 'react';
import NotebookCanvas from './NotebookCanvas';
import { useCareerStore } from '../../context/careerStore';

/**
 * Main Decision Canvas Component
 * Infinite canvas for exploring career paths - NotebookLM style
 */
export default function DecisionCanvas({ onSavePath, onCompare }) {
    const {
        currentTree,
        studentProfile,
        fetchChildren,
        fetchRootNodes,
    } = useCareerStore();

    const [rootNodes, setRootNodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load root nodes when tree changes
    useEffect(() => {
        const loadRootNodes = async () => {
            if (!currentTree) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const nodes = await fetchRootNodes(currentTree.id);
                setRootNodes(nodes || []);
            } catch (error) {
                console.error('Error loading root nodes:', error);
                setRootNodes([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadRootNodes();
    }, [currentTree, fetchRootNodes]);

    // Fetch children handler for NotebookCanvas
    const handleFetchChildren = useCallback(async (nodeId, profile) => {
        try {
            const result = await fetchChildren(nodeId, profile);
            return result;
        } catch (error) {
            console.error('Error fetching children:', error);
            return { nodes: [], edges: [] };
        }
    }, [fetchChildren]);

    return (
        <div className="canvas-container relative w-full h-full">
            <NotebookCanvas
                rootNodes={rootNodes}
                onFetchChildren={handleFetchChildren}
                studentProfile={studentProfile}
                isLoading={isLoading}
            />

            {/* Canvas title overlay - positioned over canvas */}
            <div className="fixed top-4 left-4 z-10 pointer-events-none">
                <div className="glass rounded-xl px-4 py-3">
                    <h2 className="text-lg font-semibold text-white">
                        {currentTree?.name || 'Career Explorer'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Click "Explore" to expand career paths
                    </p>
                </div>
            </div>
        </div>
    );
}

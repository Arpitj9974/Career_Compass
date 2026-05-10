import { useCareerStore } from '../../context/careerStore';

export default function CareerDetailPanel() {
    const { selectedId, nodeMap, selectNode, expandedIds, expandNode } = useCareerStore();

    if (!selectedId) return null;

    const selectedNode = nodeMap.get(selectedId);
    if (!selectedNode) return null;

    // Build breadcrumb path
    const path = [];
    let currentId = selectedId;
    while (currentId) {
        const node = nodeMap.get(currentId);
        if (node) {
            path.unshift(node);
            currentId = node.parentId;
        } else {
            break;
        }
    }

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-[#060c06]/95 backdrop-blur-md border-l border-green-900/30 p-6 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 z-50 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedNode.icon || '📄'}</span>
                    <h2 className="text-lg font-bold text-gray-100 leading-tight">
                        {selectedNode.title || selectedNode.name}
                    </h2>
                </div>
                <button
                    onClick={() => selectNode(null)}
                    className="text-gray-500 hover:text-white text-xl leading-none p-1"
                >
                    ×
                </button>
            </div>

            {/* Breadcrumb Path */}
            <div className="mb-6 flex flex-wrap items-center gap-1 text-xs">
                {path.map((node, index) => {
                    const isLast = index === path.length - 1;
                    return (
                        <div key={node.id} className="flex items-center gap-1">
                            {index > 0 && <span className="text-green-900/50">›</span>}
                            <span className={isLast ? 'text-green-400 font-medium' : 'text-gray-500'}>
                                {node.title || node.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Description */}
            {selectedNode.description && (
                <div className="mb-6 text-sm text-gray-300 leading-relaxed">
                    {selectedNode.description}
                </div>
            )}

            {/* Info Pills */}
            <div className="flex flex-col gap-3 mb-6">
                {selectedNode.duration && (
                    <div className="flex justify-between items-center bg-[#0a1609] border border-green-900/30 px-3 py-2 rounded">
                        <span className="text-xs text-gray-500">Duration</span>
                        <span className="text-sm text-green-100">{selectedNode.duration}</span>
                    </div>
                )}
                {(selectedNode.cost_min !== null && selectedNode.cost_max !== null && selectedNode.cost_max !== undefined) && (
                    <div className="flex justify-between items-center bg-[#0a1609] border border-green-900/30 px-3 py-2 rounded">
                        <span className="text-xs text-gray-500">Cost Range</span>
                        <span className="text-sm text-green-100">
                            ₹{selectedNode.cost_min.toLocaleString()} - ₹{selectedNode.cost_max.toLocaleString()}
                        </span>
                    </div>
                )}
                {selectedNode.difficulty && (
                    <div className="flex justify-between items-center bg-[#0a1609] border border-green-900/30 px-3 py-2 rounded">
                        <span className="text-xs text-gray-500">Difficulty</span>
                        <span className="text-sm text-green-100 capitalize">{selectedNode.difficulty}</span>
                    </div>
                )}
            </div>

            {/* Skills */}
            {selectedNode.skills && selectedNode.skills.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedNode.skills.map((skill, i) => (
                            <span key={i} className="text-xs bg-green-900/20 text-green-300 border border-green-900/40 px-2 py-1 rounded">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Call to action for parents */}
            {(selectedNode.lazy !== false && !expandedIds.has(selectedId)) && (
                <div className="mt-auto pt-6 border-t border-green-900/30 text-center">
                    <p className="text-xs text-gray-400 mb-3">There's more to explore here!</p>
                    <button
                        onClick={() => expandNode(selectedId)}
                        className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 py-2 rounded transition-colors text-sm font-medium"
                    >
                        Explore Children
                    </button>
                </div>
            )}
        </div>
    );
}

import { useCareerStore } from '../../context/careerStore';

export default function BreadcrumbTrail() {
    const { selectedId, nodeMap, selectNode } = useCareerStore();

    if (!selectedId) return null;

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

    if (path.length === 0) return null;

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1609]/80 backdrop-blur-md rounded-full border border-green-900/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                {path.map((node, index) => {
                    const isLast = index === path.length - 1;
                    return (
                        <div key={node.id} className="flex items-center gap-2">
                            {index > 0 && <span className="text-green-900/60 font-serif">›</span>}
                            <button
                                onClick={() => selectNode(node.id)}
                                className={`text-sm transition-colors outline-none
                                    ${isLast 
                                        ? 'text-green-400 font-medium' 
                                        : 'text-gray-400 hover:text-green-300'
                                    }`}
                            >
                                {node.title || node.name}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useCareerStore } from '../../context/careerStore';

/**
 * Saved Paths Panel Component
 * Shows bookmarked career paths and allows management
 */
export default function SavedPathsPanel({ isOpen, onClose }) {
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(false);
    const { fetchSavedPaths, isAuthenticated } = useCareerStore();

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadPaths();
        }
    }, [isOpen, isAuthenticated]);

    const loadPaths = async () => {
        setLoading(true);
        const savedPaths = await fetchSavedPaths();
        setPaths(savedPaths || []);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-30 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed left-0 top-0 h-full w-96 max-w-full z-40 
                bg-[var(--bg-secondary)] border-r border-gray-800 
                overflow-y-auto shadow-2xl animate-slide-in-left">

                {/* Header */}
                <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📌</span>
                        <h2 className="text-lg font-semibold text-white">Saved Paths</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    {!isAuthenticated ? (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">🔒</span>
                            <p className="text-gray-400 mb-4">Login to save and view your career paths</p>
                            <button className="btn-primary">
                                Login to Continue
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                        </div>
                    ) : paths.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p className="text-gray-400">No saved paths yet</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Explore careers and click "Save Path" to bookmark them
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paths.map((path) => (
                                <SavedPathCard key={path.id} path={path} onRefresh={loadPaths} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function SavedPathCard({ path, onRefresh }) {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="glass rounded-xl p-4 hover:bg-gray-800/50 transition-all duration-200">
            {/* Path header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-medium text-white">
                        {path.tree_name || 'Career Path'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        Saved {formatDate(path.created_at)}
                    </p>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                    <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>
            </div>

            {/* Path nodes preview */}
            <div className="flex flex-wrap items-center gap-1 mb-3">
                {path.nodes?.slice(0, 4).map((node, idx) => (
                    <span key={node.id} className="flex items-center">
                        <span className="text-sm px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                            {node.icon || '📍'} {node.title}
                        </span>
                        {idx < Math.min(path.nodes.length - 1, 3) && (
                            <span className="text-gray-600 mx-1">→</span>
                        )}
                    </span>
                ))}
                {path.nodes?.length > 4 && (
                    <span className="text-xs text-gray-500">
                        +{path.nodes.length - 4} more
                    </span>
                )}
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-700 animate-fade-in">
                    {/* Full path */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Full Path:</p>
                        <div className="flex flex-col gap-1">
                            {path.nodes?.map((node, idx) => (
                                <div key={node.id} className="flex items-center gap-2">
                                    <span className="w-4 h-4 flex items-center justify-center text-xs text-gray-500">
                                        {idx + 1}.
                                    </span>
                                    <span className="text-sm">
                                        {node.icon} {node.title}
                                    </span>
                                    <span className="text-xs text-gray-600 capitalize">
                                        ({node.node_type})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {path.notes && (
                        <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Notes:</p>
                            <p className="text-sm text-gray-300">{path.notes}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 btn-secondary text-sm py-2">
                            📍 View on Canvas
                        </button>
                        <button className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                            🗑️
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

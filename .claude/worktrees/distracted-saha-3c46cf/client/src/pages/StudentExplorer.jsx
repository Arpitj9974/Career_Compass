import { useEffect, useState } from 'react';
import DecisionCanvas from '../components/canvas/DecisionCanvas';
import ProfileSidebar from '../components/common/ProfileSidebar';
import SavedPathsPanel from '../components/common/SavedPathsPanel';

import ComparePanel from '../components/common/ComparePanel';
import { useCareerStore } from '../context/careerStore';

/**
 * Main Student Explorer Page
 * Contains the decision canvas and various panels
 */
export default function StudentExplorer() {
    const [showProfile, setShowProfile] = useState(false);
    const [showSavedPaths, setShowSavedPaths] = useState(false);
    const [showCompare, setShowCompare] = useState(false);
    const [compareOutcomes, setCompareOutcomes] = useState([]);
    const [toast, setToast] = useState(null);

    const { fetchTrees, currentTree, studentProfile, savePath, currentTreeId } = useCareerStore();

    useEffect(() => {
        fetchTrees();
    }, [fetchTrees]);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle path save from canvas
    const handleSavePath = async (pathNodes) => {
        const result = await savePath(currentTree?.id, pathNodes, '');
        if (result.success) {
            showToast('Path saved successfully! 📌');
        } else {
            showToast('Failed to save path', 'error');
        }
    };

    // Handle opening compare modal with outcomes
    const handleCompare = (outcomes) => {
        setCompareOutcomes(outcomes);
        setShowCompare(true);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[var(--bg-primary)]">
            {/* Main Canvas */}
            <DecisionCanvas
                onSavePath={handleSavePath}
                onCompare={handleCompare}
            />

            {/* Top toolbar */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="glass rounded-xl px-2 py-1 flex items-center gap-1">
                    <ToolbarButton
                        icon="📌"
                        label="Saved"
                        onClick={() => setShowSavedPaths(true)}
                    />
                    <div className="w-px h-6 bg-gray-700" />
                    <ToolbarButton
                        icon="⚖️"
                        label="Compare"
                        onClick={() => setShowCompare(true)}
                        disabled={compareOutcomes.length < 2}
                    />
                    <div className="w-px h-6 bg-gray-700" />
                    <ToolbarButton
                        icon="👤"
                        label="Profile"
                        onClick={() => setShowProfile(true)}
                    />
                </div>
            </div>

            {/* Profile Toggle Button (mobile fallback) */}
            <button
                onClick={() => setShowProfile(!showProfile)}
                className="fixed bottom-6 right-6 z-20 glass rounded-full p-4 
                    hover:bg-gray-700/50 transition-all duration-200
                    flex items-center gap-2 group md:hidden"
            >
                <span className="text-xl">👤</span>
            </button>

            {/* Profile Sidebar */}
            <ProfileSidebar
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />

            {/* Saved Paths Panel */}
            <SavedPathsPanel
                isOpen={showSavedPaths}
                onClose={() => setShowSavedPaths(false)}
            />

            {/* Compare Panel */}
            <ComparePanel
                isOpen={showCompare}
                onClose={() => setShowCompare(false)}
                outcomes={compareOutcomes}
            />

            {/* Breadcrumb / Path indicator */}
            <div className="fixed bottom-6 left-6 z-10">
                <div className="glass rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Exploring:</span>
                        <span className="text-white font-medium">
                            {currentTree?.name || 'Select a Tree'}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {studentProfile.interests?.slice(0, 3).map((interest, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Help tooltip */}
            <div className="fixed top-20 right-6 z-10">
                <div className="glass rounded-lg px-3 py-2 text-xs text-gray-400 max-w-xs">
                    <p className="flex items-center gap-2">
                        <span>💡</span>
                        <span>Click <strong>Explore</strong> to expand paths.
                            Drag to pan, scroll to zoom.</span>
                    </p>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`toast glass px-4 py-3 rounded-xl flex items-center gap-2 ${toast.type === 'error' ? 'border-red-500' : 'border-emerald-500'
                    } border`}>
                    <span>{toast.type === 'error' ? '❌' : '✅'}</span>
                    <span className="text-sm text-white">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

function ToolbarButton({ icon, label, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all
                ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-800/50'
                }`}
        >
            <span>{icon}</span>
            <span className="hidden sm:inline text-gray-300">{label}</span>
        </button>
    );
}

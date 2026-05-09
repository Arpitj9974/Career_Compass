import { useState } from 'react';

/**
 * Compare Outcomes Modal
 * Side-by-side comparison of career outcomes
 */
export default function CompareModal({ isOpen, onClose, outcomes = [] }) {
    const [selectedOutcomes, setSelectedOutcomes] = useState(
        outcomes.slice(0, 2).map(o => o.id)
    );

    if (!isOpen) return null;

    const selected = outcomes.filter(o => selectedOutcomes.includes(o.id));

    const formatSalary = (min, max) => {
        const formatNum = (n) => {
            if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
            return `₹${n}`;
        };
        if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
        return formatNum(max || min || 0);
    };

    const toggleOutcome = (id) => {
        if (selectedOutcomes.includes(id)) {
            if (selectedOutcomes.length > 1) {
                setSelectedOutcomes(prev => prev.filter(i => i !== id));
            }
        } else if (selectedOutcomes.length < 3) {
            setSelectedOutcomes(prev => [...prev, id]);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 
                bg-[var(--bg-secondary)] rounded-2xl shadow-2xl
                flex flex-col animate-scale-in overflow-hidden">

                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <span>⚖️</span> Compare Outcomes
                        </h2>
                        <p className="text-sm text-gray-400">
                            Select up to 3 outcomes to compare side-by-side
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Outcome selector */}
                <div className="flex-shrink-0 border-b border-gray-800 p-4">
                    <div className="flex flex-wrap gap-2">
                        {outcomes.map(outcome => (
                            <button
                                key={outcome.id}
                                onClick={() => toggleOutcome(outcome.id)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedOutcomes.includes(outcome.id)
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {outcome.icon} {outcome.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison grid */}
                <div className="flex-1 overflow-auto p-4">
                    {selected.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">📊</span>
                            <p className="text-gray-400">Select outcomes to compare</p>
                        </div>
                    ) : (
                        <div className={`grid gap-4 ${selected.length === 1 ? 'grid-cols-1' :
                                selected.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                            }`}>
                            {selected.map(outcome => (
                                <div key={outcome.id} className="glass rounded-xl p-5">
                                    {/* Header */}
                                    <div className="text-center mb-6">
                                        <span className="text-4xl mb-2 block">{outcome.icon}</span>
                                        <h3 className="text-lg font-semibold text-white">
                                            {outcome.title}
                                        </h3>
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-4">
                                        <CompareRow
                                            label="Expected Salary"
                                            value={formatSalary(outcome.cost_min, outcome.cost_max) + '/year'}
                                            highlight={true}
                                        />
                                        <CompareRow
                                            label="Duration"
                                            value={outcome.duration || 'Varies'}
                                        />
                                        <CompareRow
                                            label="Difficulty"
                                            value={outcome.difficulty || 'Medium'}
                                            badge={outcome.difficulty}
                                        />
                                        <CompareRow
                                            label="Skills Required"
                                            value={
                                                <div className="flex flex-wrap gap-1">
                                                    {(outcome.skills_required || []).slice(0, 4).map((skill, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-800">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            }
                                        />
                                        {outcome.tags && (
                                            <CompareRow
                                                label="Tags"
                                                value={
                                                    <div className="flex flex-wrap gap-1">
                                                        {outcome.tags.map((tag, i) => (
                                                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                }
                                            />
                                        )}
                                    </div>

                                    {/* Description */}
                                    {outcome.description && (
                                        <p className="mt-6 text-sm text-gray-400 border-t border-gray-700 pt-4">
                                            {outcome.description}
                                        </p>
                                    )}

                                    {/* Action */}
                                    <button className="w-full mt-6 btn-primary py-2.5 text-sm">
                                        📌 Save This Path
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function CompareRow({ label, value, highlight, badge }) {
    const getBadgeClass = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'high': return 'bg-red-900/30 text-red-400';
            case 'medium': return 'bg-yellow-900/30 text-yellow-400';
            case 'low': return 'bg-green-900/30 text-green-400';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    return (
        <div className="flex items-start justify-between">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm text-right ${highlight ? 'text-emerald-400 font-semibold' : 'text-white'}`}>
                {badge ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getBadgeClass(badge)}`}>
                        {value}
                    </span>
                ) : (
                    value
                )}
            </span>
        </div>
    );
}

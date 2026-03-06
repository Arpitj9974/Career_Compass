import { X, Trophy, Check, Minus, TrendingUp, DollarSign, Clock, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ComparePanel({ isOpen, onClose, outcomes = [] }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 400); // Wait for animation
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const [pathA, pathB] = outcomes;

    // Helper to determine winner for a metric
    const getWinner = (metric, aValue, bValue) => {
        if (!aValue || !bValue) return null;
        if (metric === 'salary') return aValue > bValue ? 'A' : bValue > aValue ? 'B' : 'Tie';
        if (metric === 'demand') {
            const scores = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            return scores[aValue] > scores[bValue] ? 'A' : scores[bValue] > scores[aValue] ? 'B' : 'Tie';
        }
        if (metric === 'duration') {
            // Lower is better
            const getYears = (str) => parseFloat(str);
            return getYears(aValue) < getYears(bValue) ? 'A' : getYears(bValue) < getYears(aValue) ? 'B' : 'Tie';
        }
        return 'Tie';
    };

    const MetricRow = ({ icon: Icon, label, metricKey, isRaw = false }) => {
        const valA = pathA?.[metricKey];
        const valB = pathB?.[metricKey];
        const winner = !isRaw ? getWinner(metricKey, valA, valB) : null;

        return (
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 py-3 border-b border-[#3F3F46] last:border-0 items-center">
                <div className={`flex items-center gap-2 justify-end ${winner === 'A' ? 'text-emerald-400 font-semibold' : 'text-gray-400'}`}>
                    <span>{valA || '-'}</span>
                    {winner === 'A' && <Check size={16} />}
                </div>

                <div className="flex flex-col items-center px-4">
                    <div className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center text-gray-400">
                        <Icon size={14} />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{label}</span>
                </div>

                <div className={`flex items-center gap-2 justify-start ${winner === 'B' ? 'text-emerald-400 font-semibold' : 'text-gray-400'}`}>
                    {winner === 'B' && <Check size={16} />}
                    <span>{valB || '-'}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={`
            fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-400 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}>
            {/* Overlay background for focus */}
            {isOpen && (
                <div
                    className="absolute inset-0 -top-[100vh] bg-black/20 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className="relative bg-[#1E1E1E] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-w-5xl mx-auto overflow-hidden border-t-4 border-[#C084FC]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-4 bg-[#27272A] border-b border-[#3F3F46]">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="text-2xl">⚖️</span>
                        Compare Career Paths
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#3F3F46] rounded-full transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Comparison Grid */}
                {pathA && pathB ? (
                    <div className="p-8">
                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="bg-[#1E1E1E] p-2 rounded-full shadow-lg">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#DB2777] rounded-full flex items-center justify-center text-white font-black italic text-lg shadow-inner border-4 border-[#1E1E1E]">
                                    VS
                                </div>
                            </div>
                        </div>

                        {/* Headers */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-8">
                            <div className="text-right pr-12">
                                <div className="text-4xl mb-2">{pathA.icon || '📄'}</div>
                                <h3 className="text-xl font-bold text-white">{pathA.title}</h3>
                                <div className="flex flex-wrap justify-end gap-1 mt-2">
                                    {pathA.badges?.map(b => (
                                        <span key={b} className="text-xs px-2 py-0.5 bg-[#27272A] rounded text-gray-400">{b}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="w-20" /> {/* Spacer for VS */}

                            <div className="text-left pl-12">
                                <div className="text-4xl mb-2">{pathB.icon || '📄'}</div>
                                <h3 className="text-xl font-bold text-white">{pathB.title}</h3>
                                <div className="flex flex-wrap justify-start gap-1 mt-2">
                                    {pathB.badges?.map(b => (
                                        <span key={b} className="text-xs px-2 py-0.5 bg-[#27272A] rounded text-gray-400">{b}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="bg-[#27272A] rounded-2xl p-6 max-w-3xl mx-auto relative overflow-hidden border border-[#3F3F46]">
                            <MetricRow
                                icon={DollarSign}
                                label="Avg Salary"
                                metricKey="salary_avg"
                                isRaw={false}
                            />
                            <MetricRow
                                icon={Clock}
                                label="Duration"
                                metricKey="duration"
                            />
                            <MetricRow
                                icon={TrendingUp}
                                label="Demand"
                                metricKey="demand"
                            />
                            <MetricRow
                                icon={Brain}
                                label="Difficulty"
                                metricKey="difficulty"
                            />
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-20 mt-8 max-w-4xl mx-auto px-10">
                            <button className="py-3 px-6 bg-gradient-to-r from-[#A78BFA] to-[#60A5FA] text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <span>Choose This Path</span>
                                <Trophy size={16} />
                            </button>
                            <button className="py-3 px-6 bg-gradient-to-r from-[#34D399] to-[#2DD4BF] text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <span>Choose This Path</span>
                                <Trophy size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400">
                        <p>Select another path to start comparing...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

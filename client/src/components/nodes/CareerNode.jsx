import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * Custom Career Node Component for React Flow
 * Playful & Friendly Design System
 * 
 * Distinct Designs:
 * 1. Goal (Purple, Large) - Root level
 * 2. Path (Blue, Medium) - Level 1
 * 3. Option (Green, Medium) - Level 2
 * 4. Outcome (Yellow, Small) - Leaf
 */
const CareerNode = memo(({ data, selected }) => {
    const {
        title,
        nodeType, // goal, path, option, outcome
        uiState = 'normal', // normal, locked, warning, recommended
        ruleMessage,
        details = [],
        onExpand,
        isExpanded,
        isLoading,
        hasChildren,
        emoji = '📄' // Default emoji if none provided
    } = data;

    // --- LEVEL STYLES ---
    const getLevelStyles = () => {
        switch (nodeType) {
            case 'goal':
                return {
                    container: 'w-80 border-4 border-[#C084FC] bg-[#1E1E1E] shadow-lg shadow-purple-900/50 rounded-[2rem]',
                    emoji: 'text-5xl mb-2',
                    title: 'text-2xl font-bold text-white',
                    button: 'bg-gradient-to-r from-[#7C3AED] to-[#DB2777] hover:from-purple-600 hover:to-pink-600 text-white'
                };
            case 'path':
                return {
                    container: 'w-72 border-2 border-[#60A5FA] bg-[#1E1E1E] shadow-md shadow-blue-900/30 rounded-2xl',
                    emoji: 'text-3xl',
                    title: 'text-lg font-bold text-white',
                    button: 'bg-[#3B82F6] hover:bg-blue-600 text-white'
                };
            case 'option':
                return {
                    container: 'w-72 border-2 border-[#34D399] bg-[#1E1E1E] shadow-md shadow-green-900/30 rounded-2xl',
                    emoji: 'text-3xl',
                    title: 'text-lg font-bold text-white',
                    button: 'bg-[#10B981] hover:bg-emerald-600 text-white'
                };
            case 'outcome':
                return {
                    container: 'w-64 border-2 border-[#FBBF24] bg-[#1E1E1E] shadow-sm shadow-yellow-900/30 rounded-xl',
                    emoji: 'text-2xl',
                    title: 'text-base font-bold text-white',
                    button: 'bg-[#F59E0B] hover:bg-amber-600 text-white'
                };
            default:
                return {
                    container: 'w-72 border-2 border-gray-600 bg-[#1E1E1E] shadow-md rounded-2xl',
                    emoji: 'text-3xl',
                    title: 'text-lg font-bold text-white',
                    button: 'bg-gray-700 text-gray-300'
                };
        }
    };

    // --- STATE STYLES ---
    const getStateStyles = () => {
        switch (uiState) {
            case 'locked':
                return 'bg-[#2A2A2A] border-dashed !border-gray-600 opacity-70 cursor-not-allowed';
            case 'warning':
                return 'bg-[#422006] !border-[#F59E0B] animate-pulse-gentle';
            case 'recommended':
                return 'bg-[#064E3B] !border-[#10B981] shadow-lg shadow-emerald-900/50 animate-glow';
            default:
                return '';
        }
    };

    const styles = getLevelStyles();
    const stateClass = getStateStyles();

    const handleClick = (e) => {
        e.stopPropagation();
        if (uiState !== 'locked' && onExpand && !isLoading) {
            onExpand();
        }
    };

    return (
        <div className="relative group">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-[#71717A] !w-4 !h-4 !border-4 !border-[#18181B] shadow-sm"
                style={{ left: '-8px' }}
            />

            {/* Main Card */}
            <div
                className={`
                    ${styles.container}
                    ${stateClass}
                    ${selected ? 'ring-2 ring-offset-2 ring-offset-[#18181B] ring-indigo-500 scale-105' : ''}
                    p-5 flex flex-col items-center text-center
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:shadow-2xl
                    ${uiState !== 'locked' ? 'cursor-pointer' : ''}
                    animate-pop
                `}
                onClick={nodeType === 'goal' ? handleClick : undefined} // Only click whole card for Goal
            >
                {/* Header Section */}
                <div className={`${nodeType === 'goal' ? 'mb-4' : 'flex items-center gap-3 mb-3 w-full'}`}>
                    <span className={styles.emoji}>{emoji}</span>
                    <h3 className={styles.title}>{title}</h3>

                    {/* Badge Icons */}
                    {uiState === 'locked' && <span className="ml-auto text-xl">🔒</span>}
                    {uiState === 'recommended' && <span className="ml-auto text-xl">⭐</span>}
                    {uiState === 'warning' && <span className="ml-auto text-xl">⚠️</span>}
                </div>

                {/* State Message Badge */}
                {ruleMessage && (
                    <div className={`
                        px-3 py-1 rounded-full text-xs font-bold mb-3 w-full
                        ${uiState === 'warning' ? 'bg-yellow-900/50 text-yellow-500 border border-yellow-700' : ''}
                        ${uiState === 'recommended' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700' : ''}
                        ${uiState === 'locked' ? 'bg-gray-800 text-gray-500' : ''}
                    `}>
                        {ruleMessage}
                    </div>
                )}

                {/* Details List */}
                {details && details.length > 0 && nodeType !== 'goal' && (
                    <div className="w-full text-left space-y-1 mb-4 bg-[#27272A] p-2 rounded-lg border border-[#3F3F46]">
                        {details.map((detail, idx) => (
                            <p key={idx} className="text-sm text-gray-400 font-medium">
                                {detail}
                            </p>
                        ))}
                    </div>
                )}

                {/* Goal Subtitle */}
                {nodeType === 'goal' && (
                    <p className="text-gray-400 font-medium mb-6">
                        Where do you want to go next?
                    </p>
                )}

                {/* Action Button */}
                {uiState !== 'locked' && hasChildren !== false && (
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={handleClick}
                            className={`
                                ${styles.button}
                                px-6 py-2 rounded-full font-bold text-sm
                                transition-all duration-300 active:scale-95
                                shadow-md flex-1 flex justify-center items-center gap-2
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Loading...
                                </>
                            ) : isExpanded ? (
                                'Collapse'
                            ) : (
                                <>
                                    {uiState === 'recommended' ? "Perfect! Let's Go" : 'Explore'}
                                    <span>→</span>
                                </>
                            )}
                        </button>

                        {/* Compare Button */}
                        {!isExpanded && !isLoading && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (data.onCompare) data.onCompare(data);
                                }}
                                className="w-10 flex items-center justify-center bg-[#27272A] hover:bg-[#3F3F46] text-gray-400 rounded-full transition-colors active:scale-95 border border-[#3F3F46]"
                                title="Add to Compare"
                            >
                                ⚖️
                            </button>
                        )}
                    </div>
                )}

                {/* Locked Button */}
                {uiState === 'locked' && (
                    <button className="w-full px-4 py-2 bg-[#27272A] text-gray-600 rounded-full text-sm font-bold cursor-help border border-[#3F3F46]">
                        Why is this locked?
                    </button>
                )}
            </div>

            {/* Output Handle */}
            {hasChildren !== false && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!bg-[#71717A] !w-4 !h-4 !border-4 !border-[#18181B] shadow-sm"
                    style={{ right: '-8px' }}
                />
            )}
        </div>
    );
});

CareerNode.displayName = 'CareerNode';

export default CareerNode;

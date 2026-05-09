import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * CareerNodeWrapper
 * React Flow wrapper that receives `data` and `id` from React Flow
 * and passes them to CanvasCard.
 */
export const CareerNodeWrapper = memo(({ id, data }) => {
    return <CanvasCard id={id} {...data} />;
});

CareerNodeWrapper.displayName = 'CareerNodeWrapper';

/**
 * CanvasCard
 * The actual visual node component.
 */
const CanvasCard = memo(({
    id,
    title,
    icon,
    level,
    description,
    isExpanded,
    isSelected,
    isLoading,
    isNew,
    onExpand,
    onSelect,
    lazy,
    node_type
}) => {
    const isLeaf = lazy === false && !isExpanded; // Simplified leaf check for visual state
    const isCenter = level === 0;

    let baseClasses = 'relative transition-all duration-300 cursor-pointer ';
    let style = {};

    // Base visual states
    if (isCenter) {
        baseClasses += 'rounded-full flex items-center justify-center text-center shadow-[0_0_20px_rgba(34,197,94,0.3)] ';
        style = {
            width: '88px',
            height: '88px',
            background: '#0a1609',
            border: '2px solid rgba(34,197,94,0.6)'
        };
    } else {
        baseClasses += 'rounded-xl min-w-[200px] max-w-[260px] p-4 ';
        if (isSelected) {
            style = {
                background: '#0c1e0e',
                border: '2px solid #22c55e',
                boxShadow: '0 0 15px rgba(34,197,94,0.4)'
            };
        } else if (isExpanded) {
            style = {
                background: '#0c1e0e',
                border: '2px solid rgba(34,197,94,0.6)'
            };
        } else if (isLeaf) {
            style = {
                background: '#080f08',
                border: '1px solid rgba(34,197,94,0.15)'
            };
        } else {
            style = {
                background: '#0a1609',
                border: '1px solid rgba(34,197,94,0.22)'
            };
        }
    }

    // Dynamic classes for animation
    if (isNew) {
        baseClasses += 'node-spawn ';
    }
    if (isLoading) {
        baseClasses += 'is-loading ';
    }

    // Handle animation end to remove the class (managed via CSS if possible, but React Flow re-renders)
    const handleAnimationEnd = (e) => {
        if (e.animationName === 'spawn') {
            e.currentTarget.classList.remove('node-spawn');
        }
    };

    const handleSelect = (e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
    };

    const handleExpand = (e) => {
        e.stopPropagation();
        if (onExpand) onExpand();
    };

    if (isCenter) {
        return (
            <div
                className={baseClasses}
                style={style}
                onClick={handleSelect}
                onAnimationEnd={handleAnimationEnd}
            >
                <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
                <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
                <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">{icon || '🧭'}</span>
                    <span className="text-xs font-bold text-green-400 leading-tight">
                        {title}
                    </span>
                </div>
                <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
            </div>
        );
    }

    return (
        <div
            className={baseClasses}
            style={style}
            onClick={handleSelect}
            onAnimationEnd={handleAnimationEnd}
        >
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Right} id="right-target" style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0 }} />
            {/* Row 1: Icon and Title */}
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon || '📄'}</span>
                <span className="text-sm font-semibold text-gray-200 flex-1 truncate">
                    {title}
                </span>
            </div>

            {/* Row 2: Description (when expanded or selected) */}
            {(isExpanded || isSelected) && description && (
                <div className="mt-3 text-xs text-gray-400 line-clamp-3">
                    {description}
                </div>
            )}

            {/* Row 3: Expand indicator */}
            {!isLeaf && (
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={handleExpand}
                        className={`text-xs px-2 py-1 rounded transition-colors
                            ${isExpanded 
                                ? 'bg-green-900/40 text-green-400 hover:bg-green-800/60' 
                                : 'bg-gray-800/50 text-gray-400 hover:text-green-400 hover:bg-green-900/30'
                            }`}
                    >
                        {isExpanded ? 'Collapse' : 'Explore ›'}
                    </button>
                </div>
            )}
            
            {/* Added style tag for the animations since we shouldn't touch external CSS if possible */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .node-spawn {
                    animation: spawn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes spawn {
                    0% { opacity: 0; transform: scale(0.3); }
                    65% { transform: scale(1.06); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .is-loading {
                    animation: pulse-border 0.9s ease-in-out infinite;
                }
                @keyframes pulse-border {
                    0% { border-color: rgba(34,197,94,0.22); }
                    50% { border-color: rgba(34,197,94,0.8); }
                    100% { border-color: rgba(34,197,94,0.22); }
                }
            `}} />
        </div>
    );
});

CanvasCard.displayName = 'CanvasCard';

export default CanvasCard;

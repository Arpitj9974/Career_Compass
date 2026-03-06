import { memo, useState, useCallback } from 'react';
import { useSound } from '../../hooks/useSound';

/**
 * Unified DecisionNode
 * One component to rule them all. No matter how deep, it's a Box.
 * Identity is consistent; only the 'data-level' attribute changes for CSS scaling.
 */
const DecisionNode = memo(({
    title,
    level,
    isActive,
    onToggleExpand,
}) => {
    const { play } = useSound();

    const handleClick = useCallback((e) => {
        e.stopPropagation();

        // 1. Sound Effect
        const pitch = 1.0 + (level * 0.1);
        play({ pitch });

        // 2. Expand/Action (Ripples now handled by parent canvas)
        onToggleExpand();
    }, [level, onToggleExpand, play]);

    return (
        <div
            className={`decision-node ${isActive ? 'active expanded' : ''}`}
            data-level={level}
            onClick={handleClick} // Box click = selection/focus
        >
            <span className="node-label truncate">{title}</span>


            {/* 
                Always render the button to maintain 'Identity'. 
                NotebookLM nodes feel like a consistent grammar.
            */}
            <button
                className="expand-btn"
                onClick={(e) => {
                    // Start propagation so the parent div click handler fires (for sound/ripple)
                    // But if we wanted separate button logic, we'd stop it.
                    // Here, clicking the button SHOULD trigger the main node action.
                    // So we actually DON'T stop propagation here, or we call handleClick directly.
                    // Let's call handleClick to be explicit.
                    handleClick(e);
                }}
            >
                ›
            </button>
        </div>
    );
});

DecisionNode.displayName = 'DecisionNode';

/**
 * CanvasNode (Legacy Wrapper)
 * Now simply passes through to the Unified DecisionNode.
 * No more if(level === 0) branching logic.
 */
const CanvasNode = ({
    data,
    level,
    onExpand,
    isExpanded
}) => {
    return (
        <DecisionNode
            title={data.name || data.title || data.label || 'Unknown'}
            level={level}
            isActive={isExpanded}
            onToggleExpand={onExpand}
        />
    );
};

export default CanvasNode;

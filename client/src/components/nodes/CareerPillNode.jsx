import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CareerPillNode = memo(({ id, data }) => {
    const {
        title,
        icon,
        isExpanded,
        isSelected,
        isLoading,
        isNew,
        hasChildren,
        onExpand,
        onSelect
    } = data;

    let containerStyle = {
        height: '46px',
        width: '220px',
        borderRadius: '24px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(13, 31, 14, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(34, 197, 94, 0.15)',
        color: '#86efac',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'visible'
    };

    if (isSelected) {
        containerStyle = {
            ...containerStyle,
            background: 'rgba(17, 40, 18, 0.9)',
            border: '2px solid #22c55e',
            color: '#4ade80',
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
            zIndex: 10
        };
    } else if (isExpanded) {
        containerStyle = {
            ...containerStyle,
            background: 'rgba(15, 36, 16, 0.85)',
            border: '1.5px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        };
    }

    let classNames = 'career-pill-node relative ';
    if (isNew) classNames += 'node-spawn ';
    if (isLoading) classNames += 'node-loading ';

    const handleSelect = (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);
    };

    const handleExpand = (e) => {
        e.stopPropagation();
        if (onExpand) onExpand(id);
    };

    return (
        <div 
            className={classNames} 
            style={containerStyle} 
            onClick={handleSelect}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.12)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
        >
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
            
            <div className="flex items-center" style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '15px', marginRight: '8px' }}>{icon || '📄'}</span>
                <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '150px',
                    letterSpacing: '0.01em'
                }}>
                    {title}
                </span>
            </div>

            {hasChildren && (
                <div 
                    onClick={handleExpand}
                    style={{
                        fontSize: '11px',
                        color: isExpanded ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.5)',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease, color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                    }}
                >
                    ›
                </div>
            )}

            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
            
            <style dangerouslySetInnerHTML={{__html: `
                .career-pill-node.node-spawn {
                    animation: spawnNode 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes spawnNode {
                    0% { opacity: 0; transform: scale(0.3); }
                    60% { transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .career-pill-node.node-loading {
                    animation: pulseLoading 0.8s ease-in-out infinite;
                }
                @keyframes pulseLoading {
                    0% { border-color: rgba(34, 197, 94, 0.25); }
                    50% { border-color: rgba(34, 197, 94, 0.8); }
                    100% { border-color: rgba(34, 197, 94, 0.25); }
                }
            `}} />
        </div>
    );
});

CareerPillNode.displayName = 'CareerPillNode';

export default CareerPillNode;

import { useState, useCallback, useEffect } from 'react';

/**
 * VerticalStack - Elastic vertical stack container with focus-centric reflow
 * 
 * Core behavior:
 * - Dynamic vertical positioning (not fixed coordinates)
 * - Focus index determines spacing
 * - Symmetric sibling movement (above -> up, below -> down)
 * - Gap created before insertion
 */
export default function VerticalStack({
    items,
    focusIndex,
    onFocusChange,
    renderItem,
    verticalGap = 150,
    expansionGap = 300, // Total gap created for expansion
}) {
    const [itemPositions, setItemPositions] = useState([]);
    const [isReflowing, setIsReflowing] = useState(false);

    // Calculate dynamic vertical positions based on focus state
    const calculatePositions = useCallback(() => {
        if (!items || items.length === 0) return [];

        const positions = [];
        let currentY = 0;

        items.forEach((item, index) => {
            if (focusIndex !== null && index === focusIndex) {
                // This is the focused item
                positions.push({
                    index,
                    y: currentY,
                    isFocused: true,
                    reflowDirection: null,
                });

                // Add expansion gap after focused item if it has children
                if (item.isExpanded) {
                    currentY += expansionGap;
                }
            } else if (focusIndex !== null && index < focusIndex) {
                // Item above focus - will move UP when sibling expands
                const moveUpAmount = item.isExpanded ? expansionGap / 2 : 0;
                positions.push({
                    index,
                    y: currentY - moveUpAmount,
                    isFocused: false,
                    reflowDirection: 'up',
                    reflowAmount: moveUpAmount,
                });
            } else if (focusIndex !== null && index > focusIndex) {
                // Item below focus - will move DOWN when sibling expands
                const focusedItem = items[focusIndex];
                const moveDownAmount = focusedItem?.isExpanded ? expansionGap / 2 : 0;

                positions.push({
                    index,
                    y: currentY + moveDownAmount,
                    isFocused: false,
                    reflowDirection: 'down',
                    reflowAmount: moveDownAmount,
                });
            } else {
                // No focus set - default stacking
                positions.push({
                    index,
                    y: currentY,
                    isFocused: false,
                    reflowDirection: null,
                });
            }

            currentY += verticalGap;
        });

        return positions;
    }, [items, focusIndex, verticalGap, expansionGap]);

    // Recalculate positions when items or focus changes
    useEffect(() => {
        const newPositions = calculatePositions();
        setItemPositions(newPositions);
    }, [calculatePositions]);

    // Trigger reflow animation when focus changes
    useEffect(() => {
        if (focusIndex !== null) {
            setIsReflowing(true);
            const timer = setTimeout(() => {
                setIsReflowing(false);
            }, 300); // Match reflow animation duration

            return () => clearTimeout(timer);
        }
    }, [focusIndex]);

    return (
        <div className="vertical-stack relative">
            {items.map((item, index) => {
                const position = itemPositions[index] || { y: index * verticalGap, isFocused: false };

                return (
                    <div
                        key={item.id}
                        className={`stack-item ${position.isFocused ? 'focused' : ''} ${isReflowing && position.reflowDirection ? `animate-reflow-${position.reflowDirection}` : ''
                            }`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: `translateY(${position.y}px)`,
                            transition: isReflowing ? 'none' : 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                            '--reflow-amount': position.reflowAmount ? `${position.reflowAmount}px` : '0px',
                        }}
                    >
                        {renderItem(item, index, {
                            isFocused: position.isFocused,
                            onFocus: () => onFocusChange(index),
                        })}
                    </div>
                );
            })}
        </div>
    );
}

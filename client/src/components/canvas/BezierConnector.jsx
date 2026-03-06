import { memo } from 'react';

/**
 * BezierConnector - Soft curved connector between parent and child nodes
 * 
 * NotebookLM specifications:
 * - Thin curved Bézier line (1.5px stroke)
 * - Neutral gray color (#71717A)
 * - No arrowheads
 * - Origin: visual center of parent card
 * - Terminus: slightly above vertical center of child card
 * - Animates in AFTER child card appears
 */
const BezierConnector = memo(({
    parentX,
    parentY,
    parentWidth,
    parentHeight,
    childX,
    childY,
    childWidth,
    childHeight,
    animate = false
}) => {
    // Calculate start point (center of parent card)
    const startX = parentX + parentWidth / 2;
    const startY = parentY + parentHeight / 2;

    // Calculate end point (slightly above center of child card)
    const endX = childX + childWidth / 2;
    const endY = childY + childHeight / 2 - 20; // 20px above center

    // Calculate horizontal gap for control points
    const horizontalGap = endX - startX;

    // Control points for natural curve
    const controlPoint1X = startX + horizontalGap * 0.4;
    const controlPoint1Y = startY;
    const controlPoint2X = endX - horizontalGap * 0.4;
    const controlPoint2Y = endY;

    // Build SVG path
    const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

    // Calculate bounding box for SVG
    const minX = Math.min(startX, endX, controlPoint1X, controlPoint2X) - 10;
    const minY = Math.min(startY, endY, controlPoint1Y, controlPoint2Y) - 10;
    const maxX = Math.max(startX, endX, controlPoint1X, controlPoint2X) + 10;
    const maxY = Math.max(startY, endY, controlPoint1Y, controlPoint2Y) + 10;
    const width = maxX - minX;
    const height = maxY - minY;

    return (
        <svg
            style={{
                position: 'absolute',
                top: minY,
                left: minX,
                width,
                height,
                pointerEvents: 'none',
                overflow: 'visible',
            }}
        >
            <path
                d={pathData}
                fill="none"
                stroke="#71717A"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={animate ? 'animate-draw' : ''}
                style={{
                    transform: `translate(${-minX}px, ${-minY}px)`,
                }}
            />
        </svg>
    );
});

BezierConnector.displayName = 'BezierConnector';

export default BezierConnector;

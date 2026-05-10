/**
 * layoutEngine.js
 * Pure JavaScript layout utility for Career Compass mindmap canvas.
 * Zero React imports. Zero Zustand imports.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SPACING CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const HORIZONTAL_GAP = 280;
const ROOT_X = -400;
const ROOT_VERTICAL_GAP = 130;
const SIBLING_VERTICAL_GAP = 80;

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: getRootPositions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a Map of root node positions stacked vertically on the left.
 * The keys are the database IDs corresponding to the categories.
 */
export function getRootPositions() {
    const map = new Map();
    
    // First root: after10 (DB ID: 100)
    map.set('100', { x: ROOT_X, y: -1.5 * ROOT_VERTICAL_GAP });
    
    // Second root: after12 (DB ID: 1)
    map.set('1', { x: ROOT_X, y: -0.5 * ROOT_VERTICAL_GAP });
    
    // Third root: career_switch (DB ID: 200)
    map.set('200', { x: ROOT_X, y: 0.5 * ROOT_VERTICAL_GAP });
    
    // Fourth root: skill_based (DB ID: 300)
    map.set('300', { x: ROOT_X, y: 1.5 * ROOT_VERTICAL_GAP });
    
    // Adding the string keys as requested just in case the system relies on them
    map.set('after10', { x: ROOT_X, y: -1.5 * ROOT_VERTICAL_GAP });
    map.set('after12', { x: ROOT_X, y: -0.5 * ROOT_VERTICAL_GAP });
    map.set('career_switch', { x: ROOT_X, y: 0.5 * ROOT_VERTICAL_GAP });
    map.set('skill_based', { x: ROOT_X, y: 1.5 * ROOT_VERTICAL_GAP });

    return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: computeChildPositions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes canvas {x, y} positions for newly expanded children.
 */
export function computeChildPositions(parentId, children, posMap, nodeMap) {
    const result = new Map();

    if (!children || children.length === 0) return result;

    // Step 1 - Get parent position
    const parentPos = posMap.get(String(parentId));
    if (!parentPos) return result;

    // Step 2 - Compute child X
    const childX = parentPos.x + HORIZONTAL_GAP;

    // Step 3 - Compute child Y positions
    const totalHeight = (children.length - 1) * SIBLING_VERTICAL_GAP;
    const startY = parentPos.y - (totalHeight / 2);

    const rawPositions = children.map((child, i) => ({
        id: String(child.id),
        x: childX,
        y: startY + (i * SIBLING_VERTICAL_GAP)
    }));

    // Step 4 - Collision avoidance
    let maxOverlap = 0;

    for (const [, existingPos] of posMap.entries()) {
        if (Math.abs(existingPos.x - childX) <= 50) {
            for (const proposed of rawPositions) {
                const overlap = 60 - Math.abs(existingPos.y - proposed.y);
                if (overlap > 0 && overlap > maxOverlap) {
                    maxOverlap = overlap;
                }
            }
        }
    }

    const yShift = maxOverlap > 0 ? maxOverlap + 20 : 0;

    // Step 5 - Return Map of childId to x,y positions
    for (const pos of rawPositions) {
        result.set(pos.id, { x: pos.x, y: pos.y + yShift });
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 3: computeEdgePath
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates an SVG cubic bezier path string.
 */
export function computeEdgePath(fromPos, toPos) {
    const cp1x = fromPos.x + (HORIZONTAL_GAP / 2);
    const cp1y = fromPos.y;
    
    const cp2x = toPos.x - (HORIZONTAL_GAP / 2);
    const cp2y = toPos.y;

    const d = `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${toPos.y}`;

    return { d };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 4: getNodeAnchorPoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns rightCenter and leftCenter edge points of a node.
 */
export function getNodeAnchorPoints(nodeId, pos, nodeWidth = 200, nodeHeight = 48) {
    // Root node width check (using IDs from database logic)
    const isRoot = ['1', '100', '200', '300', 'after10', 'after12', 'career_switch', 'skill_based'].includes(String(nodeId));
    const width = isRoot ? 220 : nodeWidth;

    return {
        rightCenter: {
            x: pos.x + (width / 2),
            y: pos.y
        },
        leftCenter: {
            x: pos.x - (width / 2),
            y: pos.y
        }
    };
}

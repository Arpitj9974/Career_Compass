/**
 * layoutEngine.js
 * Pure JavaScript layout utility for Career Compass mindmap canvas.
 * Zero React imports. Zero Zustand imports.
 * All math, no side effects.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SPACING CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Horizontal distance between a parent node and its children */
const HORIZONTAL_GAP = 280;

/** Vertical distance between the 2 root nodes on each side */
const ROOT_VERTICAL_GAP = 150;

/** Vertical distance between sibling child nodes */
const SIBLING_VERTICAL_GAP = 90;

/** How far left or right the L1 root nodes sit from the center node */
const ROOT_X_OFFSET = 320;

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: getRootPositions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns hardcoded canvas positions for the 5 top-level nodes
 * (center + 2 left roots + 2 right roots), mirroring NotebookLM layout.
 *
 * @returns {{ root: {x,y}, after10: {x,y}, career_switch: {x,y}, after12: {x,y}, skill_based: {x,y} }}
 */
export function getRootPositions() {
    return {
        'root': { x: 0, y: 0 },

        // Left side (After 10th, Career Switch)
        '100': { x: -ROOT_X_OFFSET, y: -(ROOT_VERTICAL_GAP / 2) },
        '200': { x: -ROOT_X_OFFSET, y:  (ROOT_VERTICAL_GAP / 2) },

        // Right side (After 12th, Skill Based)
        '1':   { x: ROOT_X_OFFSET, y: -(ROOT_VERTICAL_GAP / 2) },
        '300': { x: ROOT_X_OFFSET, y:  (ROOT_VERTICAL_GAP / 2) },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: getNodeDirection
// ─────────────────────────────────────────────────────────────────────────────

const LEFT_ROOT_IDS  = new Set(['100', '200']);
const RIGHT_ROOT_IDS = new Set(['1', '300']);

/**
 * Determines whether a node belongs to the left (-1) or right (+1) side
 * of the canvas by walking up the parentId chain.
 *
 * @param {string} nodeId
 * @param {Map<string, object>} nodeMap — nodeMap from the Zustand store
 * @returns {-1 | 0 | 1}
 */
export function getNodeDirection(nodeId, nodeMap) {
    if (nodeId === 'root') return 0;

    let current = nodeId;
    let iterations = 0;

    while (iterations < 10) {
        const node = nodeMap.get(current);
        if (!node) break;

        // We've reached a direct child of root — check which side it belongs to
        if (node.parentId === 'root') {
            if (LEFT_ROOT_IDS.has(current))  return -1;
            if (RIGHT_ROOT_IDS.has(current)) return  1;
            // Unknown root child — fall through to default
            break;
        }

        // Walk one level up
        current = node.parentId;
        iterations++;
    }

    return 1; // Default to right side
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 3: computeChildPositions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes canvas {x, y} positions for a set of newly expanded children.
 * Handles vertical centering, sibling stacking, and basic collision avoidance.
 *
 * @param {string} parentId — id of the node being expanded
 * @param {object[]} children — array of child node objects from API
 * @param {Map<string, {x:number, y:number}>} posMap — current posMap from store
 * @param {Map<string, object>} nodeMap — current nodeMap from store
 * @returns {Map<string, {x:number, y:number}>}
 */
export function computeChildPositions(parentId, children, posMap, nodeMap) {
    const result = new Map();

    if (!children || children.length === 0) return result;

    const parentPos = posMap.get(String(parentId));
    if (!parentPos) return result;

    const direction = getNodeDirection(String(parentId), nodeMap);

    // ── Compute raw x position for all children ──────────────────────────────
    const childX = parentPos.x + direction * HORIZONTAL_GAP;

    // ── Compute raw y positions (vertically centred around parent) ───────────
    const totalHeight = (children.length - 1) * SIBLING_VERTICAL_GAP;
    const startY = parentPos.y - totalHeight / 2;

    const rawPositions = children.map((child, i) => ({
        id: String(child.id),
        x: childX,
        y: startY + i * SIBLING_VERTICAL_GAP,
    }));

    // ── Collision avoidance ───────────────────────────────────────────────────
    // Find existing nodes whose x is within ±50 px of childX
    let maxOverlap = 0;

    for (const [, existingPos] of posMap.entries()) {
        if (Math.abs(existingPos.x - childX) <= 50) {
            // Check each proposed child y against this existing node's y
            for (const proposed of rawPositions) {
                const overlap = 60 - Math.abs(existingPos.y - proposed.y);
                if (overlap > 0 && overlap > maxOverlap) {
                    maxOverlap = overlap;
                }
            }
        }
    }

    // Shift the whole group down if there's a collision
    const yShift = maxOverlap > 0 ? maxOverlap + 20 : 0;

    for (const pos of rawPositions) {
        result.set(pos.id, { x: pos.x, y: pos.y + yShift });
    }

    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 4: getEdgePoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates an SVG cubic bezier path string connecting a parent node
 * to a child node on the mindmap canvas.
 *
 * @param {{ x: number, y: number }} fromPos — center of the parent node
 * @param {{ x: number, y: number }} toPos   — center of the child node
 * @param {-1 | 1} direction — -1 for left side, +1 for right side
 * @returns {{ d: string }} — object containing the SVG path string
 */
export function getEdgePoints(fromPos, toPos, direction) {
    const halfGap = HORIZONTAL_GAP / 2;

    let cp1x, cp1y, cp2x, cp2y;

    if (direction >= 0) {
        // Right side: control points curve outward to the right
        cp1x = fromPos.x + halfGap;
        cp1y = fromPos.y;
        cp2x = toPos.x - halfGap;
        cp2y = toPos.y;
    } else {
        // Left side: control points curve outward to the left
        cp1x = fromPos.x - halfGap;
        cp1y = fromPos.y;
        cp2x = toPos.x + halfGap;
        cp2y = toPos.y;
    }

    const d = `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${toPos.x} ${toPos.y}`;

    return { d };
}

import React, { useRef, useEffect } from 'react';
import { useCamera } from './InfiniteCanvas';

/**
 * NotebookMiniMap - Essential Navigation Overview
 * Renders scaled-down view + Viewport Indicator + Click-to-Teleport
 */
export default function MiniMap({ items, layout }) {
    const { camera, setView, containerRef } = useCamera();
    const canvasRef = useRef(null);

    // Constants
    const MAP_WIDTH = 240;
    const MAP_HEIGHT = 160;
    const PADDING = 500; // Extra world padding

    // Helper: Compute world bounds
    const getBounds = () => {
        if (!items || items.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        items.forEach(item => {
            const pos = layout[item.id];
            if (pos) {
                minX = Math.min(minX, pos.x);
                maxX = Math.max(maxX, pos.x + 280);
                minY = Math.min(minY, pos.y);
                maxY = Math.max(maxY, pos.y + 180);
            }
        });

        return {
            minX: minX - PADDING,
            maxX: maxX + PADDING,
            minY: minY - PADDING,
            maxY: maxY + PADDING
        };
    };

    // Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        // Background
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        if (items.length === 0 || !layout) return;

        const bounds = getBounds();
        const worldWidth = bounds.maxX - bounds.minX;
        const worldHeight = bounds.maxY - bounds.minY;

        // Scale factors
        const scaleX = MAP_WIDTH / worldWidth;
        const scaleY = MAP_HEIGHT / worldHeight;
        const mapScale = Math.min(scaleX, scaleY);

        const mapOffsetX = (MAP_WIDTH - worldWidth * mapScale) / 2;
        const mapOffsetY = (MAP_HEIGHT - worldHeight * mapScale) / 2;

        const toMap = (x, y) => ({
            x: (x - bounds.minX) * mapScale + mapOffsetX,
            y: (y - bounds.minY) * mapScale + mapOffsetY
        });

        // 1. Draw Nodes
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        items.forEach(item => {
            const pos = layout[item.id];
            if (pos) {
                const mapPos = toMap(pos.x, pos.y);

                // Active node color (if focused?)
                // Simple version: just gray blocks
                ctx.fillRect(mapPos.x, mapPos.y, 280 * mapScale, 180 * mapScale);
            }
        });

        // 2. Draw Viewport Rect
        if (containerRef.current) {
            const { width: vpW, height: vpH } = containerRef.current.getBoundingClientRect();

            // Viewport in World Coordinates
            // camX / Z is shift logic...
            // worldX = (screenX - camX) / Z

            const viewWorldX = (0 - camera.x) / camera.z;
            const viewWorldY = (0 - camera.y) / camera.z;
            const viewWorldW = vpW / camera.z;
            const viewWorldH = vpH / camera.z;

            const mapRectStart = toMap(viewWorldX, viewWorldY);

            ctx.strokeStyle = '#6366F1'; // Indigo 500
            ctx.lineWidth = 2;
            ctx.strokeRect(
                mapRectStart.x,
                mapRectStart.y,
                viewWorldW * mapScale,
                viewWorldH * mapScale
            );
        }

    }, [items, layout, camera, containerRef]);


    // Click Interaction (Teleport)
    const handleMapClick = (e) => {
        if (!containerRef.current) return;

        const rect = e.target.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Map -> World
        const bounds = getBounds();
        const worldWidth = bounds.maxX - bounds.minX;
        const worldHeight = bounds.maxY - bounds.minY;
        const scaleX = MAP_WIDTH / worldWidth;
        const scaleY = MAP_HEIGHT / worldHeight;
        const mapScale = Math.min(scaleX, scaleY);
        const mapOffsetX = (MAP_WIDTH - worldWidth * mapScale) / 2;
        const mapOffsetY = (MAP_HEIGHT - worldHeight * mapScale) / 2;

        const worldX = (clickX - mapOffsetX) / mapScale + bounds.minX;
        const worldY = (clickY - mapOffsetY) / mapScale + bounds.minY;

        // Center camera
        const { width: vpW, height: vpH } = containerRef.current.getBoundingClientRect();

        const newCamX = (vpW / 2) - (worldX * camera.z);
        const newCamY = (vpH / 2) - (worldY * camera.z);

        setView(newCamX, newCamY, camera.z);
    };

    return (
        <div className="absolute bottom-6 right-6 pointer-events-auto z-50">
            <canvas
                ref={canvasRef}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                className="block border border-[#333] rounded shadow-xl cursor-crosshair bg-black"
                onClick={handleMapClick}
            />
        </div>
    );
}

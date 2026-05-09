import { useRef, useState, useCallback, useEffect, createContext, useContext } from 'react';

// Camera Context for minimap and other controls
const CameraContext = createContext(null);

export const useCamera = () => {
    const context = useContext(CameraContext);
    if (!context) throw new Error("useCamera must be used within InfiniteCanvas");
    return context;
};

/**
 * InfiniteCanvas - Robust Camera Engine
 * 
 * Implements the "Single Transform Root" pattern.
 * - Wrapper div handles events (Wheel, MouseDown/Move/Up)
 * - Inner div gets the CSS Transform
 * - Exposes camera state via Context
 * - Supports OVERLAYS that do NOT move with camera
 */
export default function InfiniteCanvas({ children, className = '', overlays }) {
    const containerRef = useRef(null);
    const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // ZOOM CONFIG
    const MIN_ZOOM = 0.05;
    const MAX_ZOOM = 3.0;
    const ZOOM_SPEED = 0.001;

    // --- INTERACTION HANDLERS ---

    const handleMouseDown = useCallback((e) => {
        // Only Left/Middle click
        if (e.button !== 0 && e.button !== 1) return;

        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        e.preventDefault(); // Prevent text selection
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        lastMousePos.current = { x: e.clientX, y: e.clientY };

        setCamera(prev => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy
        }));
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Global mouse up to catch drags that leave window
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
            return () => {
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, [isDragging, handleMouseUp, handleMouseMove]);

    // ZOOM HANDLER (Centers on Cursor)
    const handleWheel = useCallback((e) => {
        e.preventDefault();

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        // Determine zoom delta
        const delta = -e.deltaY * ZOOM_SPEED;

        setCamera(prev => {
            const newZ = Math.min(Math.max(prev.z + delta, MIN_ZOOM), MAX_ZOOM);

            // Math to keep cursor point stable:
            // worldPoint = (cursor - camera) / oldZ
            // newCamera = cursor - worldPoint * newZ

            const worldX = (cursorX - prev.x) / prev.z;
            const worldY = (cursorY - prev.y) / prev.z;

            const newX = cursorX - worldX * newZ;
            const newY = cursorY - worldY * newZ;

            return { x: newX, y: newY, z: newZ };
        });
    }, []);

    // Attach wheel listener non-passively
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);


    // API: Allow external control
    const setView = useCallback((x, y, z) => {
        setCamera(prev => ({
            x: x !== undefined ? x : prev.x,
            y: y !== undefined ? y : prev.y,
            z: z !== undefined ? z : prev.z
        }));
    }, []);

    const contextValue = {
        camera,
        setView,
        containerRef
    };

    return (
        <CameraContext.Provider value={contextValue}>
            <div
                ref={containerRef}
                className={`w-full h-full overflow-hidden bg-[#121212] relative ${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
            >
                {/* TRANSFORM LAYER - EVERYTHING LIVES HERE */}
                <div
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
                        transformOrigin: '0 0',
                        position: 'absolute',
                        transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        willChange: 'transform',
                    }}
                >
                    {children}
                </div>

                {/* OVERLAY SLOT - Items here stay fixed to viewport (Minimap, Controls) */}
                {overlays && (
                    <div className="absolute inset-0 pointer-events-none z-50">
                        {overlays}
                    </div>
                )}
            </div>
        </CameraContext.Provider>
    );
}

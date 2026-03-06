// Helper to bridge Camera Context
const CameraController = ({ targetCamera }) => {
    const { setView, camera, containerRef } = useCamera();

    useEffect(() => {
        if (targetCamera && containerRef.current) {
            const { height } = containerRef.current.getBoundingClientRect();

            // Center Y logic: 
            // ScreenCenterY = TranslateY + NodeY * Zoom
            // TranslateY = ScreenCenterY - NodeY * Zoom
            // We use Zoom=1 or current camera.z

            // NotebookLM specific: If zooming, it stays relative to cursor.
            // Auto-Focus: Usually resets zoom to readable? Or keeps current?
            // Keep current.

            const targetY = (height / 2) - (targetCamera.y * camera.z);

            // Smooth Pan? InfiniteCanvas handles raw state.
            // We can animate it via SetView if we add an interpolator, 
            // but strict set is "Camera Recenters" per prompt.

            setView(undefined, targetY, undefined); // Keep X, Z

            // Wait, do we keep X? Or pan X to show children?
            // Usually we pan X so the expanded node is on the Left/Center-Left.
            // Let's center X too for now if huge tree.
            const { width } = containerRef.current.getBoundingClientRect();
            // const targetX = (width * 0.3) - (targetCamera.x * camera.z); // Left-third rule?
            // Let's just keep X stable/manual for now as requested "Vertical Center".
        }
    }, [targetCamera]); // Triggers when layout calculation returns a new target

    return null;
}

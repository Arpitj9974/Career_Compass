import { useRef, useCallback, useEffect } from 'react';

/**
 * FocusManager - Viewport centering for focused items
 * 
 * Ensures the focused item is always centered in the viewport
 * Smoothly pans to keep user's focus visible
 */
export default function FocusManager({
    focusedElement,
    canvasRef,
    viewportRef,
    onViewportChange,
}) {
    const animationFrameRef = useRef(null);

    // Calculate center position for an element
    const calculateCenterPosition = useCallback((element) => {
        if (!element || !viewportRef.current) return null;

        const elementRect = element.getBoundingClientRect();
        const viewportRect = viewportRef.current.getBoundingClientRect();

        // Calculate offset needed to center element in viewport
        const centerX = viewportRect.width / 2 - elementRect.width / 2;
        const centerY = viewportRect.height / 2 - elementRect.height / 2;

        const currentX = elementRect.left - viewportRect.left;
        const currentY = elementRect.top - viewportRect.top;

        return {
            offsetX: centerX - currentX,
            offsetY: centerY - currentY,
        };
    }, [viewportRef]);

    // Smoothly animate to center position
    const animateToCenter = useCallback((targetOffset) => {
        if (!targetOffset || !canvasRef.current) return;

        const startTime = performance.now();
        const duration = 400; // Smooth centering animation

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-in-out timing
            const eased = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;

            // Apply transform
            const currentOffsetX = targetOffset.offsetX * eased;
            const currentOffsetY = targetOffset.offsetY * eased;

            if (onViewportChange) {
                onViewportChange({
                    x: currentOffsetX,
                    y: currentOffsetY,
                    scale: 1,
                });
            }

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [canvasRef, onViewportChange]);

    // Center viewport on focused element
    useEffect(() => {
        if (focusedElement) {
            const targetOffset = calculateCenterPosition(focusedElement);
            if (targetOffset) {
                animateToCenter(targetOffset);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [focusedElement, calculateCenterPosition, animateToCenter]);

    return null; // This is a behavioral component, no UI
}

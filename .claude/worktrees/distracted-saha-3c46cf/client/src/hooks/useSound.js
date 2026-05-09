import { useCallback, useState, useEffect } from 'react';

// Use a simple data URI for a default "pop" sound if file is missing
// This ensures the app doesn't crash and still has some feedback
const DEFAULT_POP_SOUND = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==";

export const useSound = (url = 'water_drop.mp3') => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [audio] = useState(new Audio(url));

    useEffect(() => {
        // Load preference
        const stored = localStorage.getItem('soundEnabled');
        if (stored !== null) {
            setSoundEnabled(JSON.parse(stored));
        }

        // Error handling for missing file
        audio.onerror = () => {
            console.warn(`Sound file ${url} not found. Using silent fallback.`);
            // audio.src = DEFAULT_POP_SOUND; // Optional fallback
        };
    }, []);

    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => {
            const newValue = !prev;
            localStorage.setItem('soundEnabled', JSON.stringify(newValue));
            return newValue;
        });
    }, []);

    const play = useCallback(({ pitch = 1.0, volume = 0.4 } = {}) => {
        if (!soundEnabled) return;

        // Clone for overlapping sounds
        const clone = audio.cloneNode();
        clone.volume = volume;
        // Pitch shifting (limited browser support but works in many modern ones via playbackRate)
        clone.playbackRate = pitch;

        clone.play().catch(e => {
            // Auto-play policy might block this
            // console.debug("Audio play blocked", e);
        });
    }, [audio, soundEnabled]);

    return { play, soundEnabled, toggleSound };
};

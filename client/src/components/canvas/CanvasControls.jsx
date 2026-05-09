import { useReactFlow } from '@xyflow/react';

export default function CanvasControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-50">
            <div className="bg-[#0a1609]/90 backdrop-blur border border-green-900/40 rounded-lg p-1 flex flex-col shadow-lg">
                <button
                    onClick={() => zoomIn({ duration: 300 })}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded transition-colors"
                    title="Zoom In"
                >
                    +
                </button>
                <div className="h-px bg-green-900/40 mx-1" />
                <button
                    onClick={() => zoomOut({ duration: 300 })}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded transition-colors"
                    title="Zoom Out"
                >
                    −
                </button>
                <div className="h-px bg-green-900/40 mx-1" />
                <button
                    onClick={() => fitView({ padding: 0.3, duration: 500 })}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-900/30 rounded transition-colors text-xs"
                    title="Fit View"
                >
                    [ ]
                </button>
            </div>
        </div>
    );
}

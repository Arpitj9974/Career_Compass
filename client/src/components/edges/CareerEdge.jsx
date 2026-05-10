import React from 'react';
import { BaseEdge } from '@xyflow/react';

export default function CareerEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    style
}) {
    // Use precomputed path if available, otherwise compute the S-curve bracket
    let pathD = data?.d;
    
    if (!pathD) {
        // Stay horizontal for a bit longer to look cleaner
        const cp1x = sourceX + 150;
        const cp1y = sourceY;
        const cp2x = targetX - 150;
        const cp2y = targetY;
        
        pathD = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
    }

    return (
        <BaseEdge 
            id={id} 
            path={pathD} 
            style={{
                ...style,
                fill: 'none',
                strokeLinecap: 'round'
            }} 
        />
    );
}

import React, { useMemo } from 'react';
import type { Fish } from '../types';

const darkenColor = (colorStr: string, amount: number) => {
  let color = colorStr.startsWith('#') ? colorStr.slice(1) : colorStr;
  const num = parseInt(color, 16);
  let r = (num >> 16) - amount;
  r = r < 0 ? 0 : r;
  let g = ((num >> 8) & 0x00FF) - amount;
  g = g < 0 ? 0 : g;
  let b = (num & 0x0000FF) - amount;
  b = b < 0 ? 0 : b;
  const newColor = (g | (b << 8) | (r << 16));
  return '#' + ("000000" + newColor.toString(16)).slice(-6);
};

const FishComponent: React.FC<Fish> = ({ id, x, y, size, color, dx, animationTicker, tailAnimationSpeed }) => {
  const direction = dx >= 0 ? 1 : -1;
  const aspectRatio = 1.8;
  const width = size;
  const height = size / aspectRatio;

  const bobbing = Math.sin(animationTicker * 0.05) * (size * 0.05);
  
  const gradientId = `grad-${id}`;
  const darkerColor = useMemo(() => darkenColor(color, 20), [color]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        transform: `scaleX(${direction}) translateY(${bobbing}px)`,
        transition: 'transform 0.5s ease-out',
        willChange: 'transform, left, top',
      }}
    >
      <svg
        viewBox="0 0 120 60"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color }} />
            <stop offset="100%" style={{ stopColor: darkerColor }} />
          </linearGradient>
        </defs>
        
        <g>
          {/* Tail */}
          <path
            d="M 25 30 C 5 10, 5 50, 25 30 Z"
            fill={`url(#${gradientId})`}
            style={{
              transformOrigin: '25px 30px',
              animationName: 'swim-tail',
              animationDuration: `${tailAnimationSpeed}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          />

          {/* Body */}
          <path
            d="M 20,30 C 40,0 100,0 110,30 C 100,60 40,60 20,30 Z"
            fill={`url(#${gradientId})`}
          />

          {/* Pectoral Fin */}
          <path 
              d="M 75 35 C 90 25, 90 45, 75 35 Z"
              fill={color}
              style={{ opacity: 0.8, filter: 'brightness(1.1)' }}
          />

          {/* Eye */}
          <circle cx="98" cy="25" r="4" fill="white" />
          <circle cx="99" cy="25" r="2" fill="black" />
        </g>
      </svg>
    </div>
  );
};

export default React.memo(FishComponent);
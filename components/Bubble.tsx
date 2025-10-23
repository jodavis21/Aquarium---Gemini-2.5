
import React from 'react';
import type { Bubble } from '../types';

const Bubble: React.FC<Bubble> = ({ x, y, size }) => {
  return (
    <div
      className="absolute rounded-full border-2 border-cyan-300/50"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        opacity: Math.max(0.1, size / 25),
      }}
    ></div>
  );
};

export default React.memo(Bubble);

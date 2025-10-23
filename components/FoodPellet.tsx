
import React from 'react';
import type { Food } from '../types';

const FoodPellet: React.FC<Food> = ({ x, y }) => {
  return (
    <div
      className="absolute w-2 h-2 bg-yellow-800/80 rounded-full shadow-lg"
      style={{ left: x, top: y }}
    ></div>
  );
};

export default React.memo(FoodPellet);

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Fish, Food, Bubble } from '../types';
import {
  NUM_FISH,
  FISH_SIZE_MIN,
  FISH_SIZE_MAX,
  FISH_SPEED_MIN,
  FISH_SPEED_MAX,
  FISH_ACCELERATION,
  FOOD_SINK_SPEED,
  FISH_DETECTION_RADIUS,
  FISH_EAT_RADIUS,
  TURN_COOLDOWN_MIN,
  TURN_COOLDOWN_MAX,
  NUM_BUBBLES,
  BUBBLE_SPEED_MIN,
  BUBBLE_SPEED_MAX,
  BUBBLE_SIZE_MIN,
  BUBBLE_SIZE_MAX,
} from '../constants';

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const fishColors = ['#ff6b6b', '#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];

export const useAquarium = (width: number, height: number) => {
  const stateRef = useRef<{ fish: Fish[]; food: Food[]; bubbles: Bubble[] }>({ fish: [], food: [], bubbles: [] });
  const [renderState, setRenderState] = useState(stateRef.current);
  const animationFrameId = useRef<number | null>(null);

  const createFish = useCallback((id: number): Fish => {
    const angle = randomBetween(0, 2 * Math.PI);
    const speed = randomBetween(FISH_SPEED_MIN, FISH_SPEED_MAX);
    return {
      id,
      x: randomBetween(50, width - 50),
      y: randomBetween(50, height - 100),
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      color: fishColors[Math.floor(Math.random() * fishColors.length)],
      size: randomBetween(FISH_SIZE_MIN, FISH_SIZE_MAX),
      targetFoodId: null,
      turnCooldown: randomBetween(0, TURN_COOLDOWN_MAX),
      speed,
      animationTicker: randomBetween(0, 360),
      tailAnimationSpeed: randomBetween(1.5, 2.5),
    };
  }, [width, height]);

  const createBubble = useCallback((id: number): Bubble => {
      return {
          id,
          x: randomBetween(0, width),
          y: height + randomBetween(0, 50),
          size: randomBetween(BUBBLE_SIZE_MIN, BUBBLE_SIZE_MAX),
          speed: randomBetween(BUBBLE_SPEED_MIN, BUBBLE_SPEED_MAX),
      };
  }, [width, height]);

  useEffect(() => {
    stateRef.current.fish = Array.from({ length: NUM_FISH }, (_, i) => createFish(i));
    stateRef.current.bubbles = Array.from({ length: NUM_BUBBLES }, (_, i) => createBubble(i));
    stateRef.current.food = [];
    setRenderState({ ...stateRef.current });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, createFish, createBubble]);

  const gameLoop = useCallback(() => {
    const { fish, food, bubbles } = stateRef.current;
    const eatenFoodIds = new Set<number>();

    // Update Fish
    fish.forEach(f => {
      f.animationTicker++;
      let closestFood: Food | null = null;
      let minDistance = FISH_DETECTION_RADIUS;

      if (!f.targetFoodId) {
        food.forEach(p => {
          if (eatenFoodIds.has(p.id)) return;
          const dx = p.x - f.x;
          const dy = p.y - f.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < minDistance) {
            minDistance = distance;
            closestFood = p;
          }
        });
        if (closestFood) {
          f.targetFoodId = closestFood.id;
        }
      }

      const targetFood = food.find(p => p.id === f.targetFoodId);
      if (targetFood && !eatenFoodIds.has(targetFood.id)) {
        const dx = targetFood.x - f.x;
        const dy = targetFood.y - f.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < FISH_EAT_RADIUS) {
          eatenFoodIds.add(targetFood.id);
          f.targetFoodId = null;
        } else {
          const angle = Math.atan2(dy, dx);
          const effectiveSpeed = f.speed * FISH_ACCELERATION;
          f.dx = Math.cos(angle) * effectiveSpeed;
          f.dy = Math.sin(angle) * effectiveSpeed;
        }
      } else {
        f.targetFoodId = null;
        f.turnCooldown--;
        if (f.turnCooldown <= 0) {
          const newAngle = randomBetween(0, 2 * Math.PI);
          f.dx = Math.cos(newAngle) * f.speed;
          f.dy = Math.sin(newAngle) * f.speed;
          f.turnCooldown = randomBetween(TURN_COOLDOWN_MIN, TURN_COOLDOWN_MAX);
        }
      }
      
      f.x += f.dx;
      f.y += f.dy;

      if (f.x < 0 || f.x > width - f.size) f.dx *= -1;
      if (f.y < 0 || f.y > height - f.size - 80) f.dy *= -1;
    });

    // Update Food
    const newFood = food
        .map(p => ({ ...p, y: p.y + FOOD_SINK_SPEED }))
        .filter(p => p.y < height - 80 && !eatenFoodIds.has(p.id));
    stateRef.current.food = newFood;
      
    // Update Bubbles
    bubbles.forEach(b => {
        b.y -= b.speed;
        if(b.y < -b.size) {
            Object.assign(b, createBubble(b.id));
        }
    });

    setRenderState({ fish, food: newFood, bubbles });
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [width, height, createBubble]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  const addFood = useCallback(() => {
    const newFood: Food = {
      id: Date.now() + Math.random(),
      x: randomBetween(0, width),
      y: 0,
    };
    stateRef.current.food.push(newFood);
  }, [width]);

  return { ...renderState, addFood };
};
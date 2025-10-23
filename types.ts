export interface Point {
  x: number;
  y: number;
}

export interface Fish extends Point {
  id: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  targetFoodId: number | null;
  turnCooldown: number;
  speed: number;
  animationTicker: number;
  tailAnimationSpeed: number;
}

export interface Food extends Point {
  id: number;
}

export interface Bubble extends Point {
  id: number;
  size: number;
  speed: number;
}
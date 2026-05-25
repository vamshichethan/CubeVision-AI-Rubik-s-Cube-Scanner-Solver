import type { Move } from '../types/cube';

export const MOVE_ANIMATION_MS = 420;

export function animationAngle(move: Move, progress: number): number {
  const direction = move.prime ? -1 : 1;
  return direction * progress * (Math.PI / 2);
}

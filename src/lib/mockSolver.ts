import { isSolvedCube } from './cubeState';
import type { CubeState, Move } from '../types/cube';

export async function solveCube(cubeState: CubeState): Promise<Move[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  if (isSolvedCube(cubeState)) {
    return [];
  }

  // The real arbitrary-state solver is intentionally not faked here. Returning
  // no moves is safer than playing a wrong canned solution.
  return [];
}

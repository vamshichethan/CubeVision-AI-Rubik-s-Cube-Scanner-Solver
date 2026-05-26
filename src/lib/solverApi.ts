import { FACE_ORDER, isSolvedCube } from './cubeState';
import type CubeJs from 'cubejs';
import type { CubeColor, CubeState, FaceName, Move, MoveFace } from '../types/cube';

type SolveSearchResult = {
  moves: Move[];
  success: boolean;
  message: string;
  nodesExplored: number;
  depthReached: number;
  timeTakenMs?: number;
};

const SOLVER_FACES: MoveFace[] = ['R', 'L', 'U', 'D', 'F', 'B'];
const CUBEJS_FACE_ORDER: FaceName[] = ['up', 'right', 'front', 'down', 'left', 'back'];
const CUBEJS_FACE_LETTER: Record<FaceName, string> = {
  up: 'U',
  right: 'R',
  front: 'F',
  down: 'D',
  left: 'L',
  back: 'B'
};

let cubeJsModulePromise: Promise<typeof CubeJs> | null = null;
let cubeJsReady = false;

type BackendSolveResponse = {
  success: boolean;
  solution?: string[];
  message?: string;
  timeTakenMs?: number;
};

async function loadCubeJs(): Promise<typeof CubeJs> {
  if (!cubeJsModulePromise) {
    cubeJsModulePromise = import('cubejs').then((module) => module.default ?? module);
  }
  const Cube = await cubeJsModulePromise;
  if (!cubeJsReady) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    Cube.initSolver();
    cubeJsReady = true;
  }
  return Cube;
}

function cubeToKociembaFacelets(cubeState: CubeState): string {
  const colorToFace = FACE_ORDER.reduce(
    (map, face) => {
      map[cubeState[face][4].color] = CUBEJS_FACE_LETTER[face];
      return map;
    },
    {} as Record<CubeColor, string>
  );

  return CUBEJS_FACE_ORDER.map((face) =>
    cubeState[face].map((sticker) => colorToFace[sticker.color] ?? '?').join('')
  ).join('');
}

function kociembaTokenToQuarterMoves(token: string): Move[] {
  const face = token[0] as MoveFace;
  if (!SOLVER_FACES.includes(face)) return [];
  if (token.endsWith('2')) return [{ face }, { face }];
  return [{ face, prime: token.endsWith("'") }];
}

function parseKociembaSolution(solution: string): Move[] {
  return solution
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(kociembaTokenToQuarterMoves);
}

async function solveWithBackend(cubeState: CubeState): Promise<SolveSearchResult> {
  const startedAt = performance.now();
  const response = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cubeState })
  });
  if (!response.ok) throw new Error('Kociemba backend is not available');

  const payload = (await response.json()) as BackendSolveResponse;
  if (!payload.success) throw new Error(payload.message ?? 'Kociemba backend rejected this cube state');

  const moves = (payload.solution ?? []).flatMap(kociembaTokenToQuarterMoves);
  return {
    moves,
    success: true,
    message: moves.length
      ? `Backend Kociemba two-phase solver found ${moves.length} quarter-turn animation moves.`
      : 'Cube is already solved.',
    nodesExplored: 0,
    depthReached: moves.length,
    timeTakenMs: payload.timeTakenMs ?? performance.now() - startedAt
  };
}

async function solveWithKociemba(cubeState: CubeState): Promise<SolveSearchResult> {
  const startedAt = performance.now();
  const Cube = await loadCubeJs();
  const cube = Cube.fromString(cubeToKociembaFacelets(cubeState));
  if (cube.isSolved()) {
    return {
      moves: [],
      success: true,
      message: 'Cube is already solved.',
      nodesExplored: 0,
      depthReached: 0,
      timeTakenMs: performance.now() - startedAt
    };
  }
  const solutionText = cube.solve();
  const moves = parseKociembaSolution(solutionText);
  return {
    moves,
    success: true,
    message: moves.length
      ? `Kociemba two-phase solver found ${moves.length} quarter-turn animation moves.`
      : 'Cube is already solved.',
    nodesExplored: 0,
    depthReached: moves.length,
    timeTakenMs: performance.now() - startedAt
  };
}

export async function solveCube(cubeState: CubeState): Promise<SolveSearchResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  if (isSolvedCube(cubeState)) {
    return {
      moves: [],
      success: true,
      message: 'Cube is already solved.',
      nodesExplored: 0,
      depthReached: 0
    };
  }

  try {
    return await solveWithBackend(cubeState);
  } catch (error) {
    console.warn(
      'Kociemba backend unavailable, using in-browser Kociemba package:',
      error instanceof Error ? error.message : error
    );
  }

  try {
    return await solveWithKociemba(cubeState);
  } catch (error) {
    return {
      moves: [],
      success: false,
      message: `Kociemba could not solve this cube state. ${error instanceof Error ? error.message : 'Check physical validity/parity.'}`,
      nodesExplored: 0,
      depthReached: 0
    };
  }
}

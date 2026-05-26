import { FACE_ORDER, isSolvedCube } from './cubeState';
import { applyMove, cubeToCompactString, moveToString } from './moves';
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

const SEARCH_FACES: MoveFace[] = ['R', 'L', 'U', 'D', 'F', 'B'];
const SEARCH_MOVES: Move[] = SEARCH_FACES.flatMap((face) => [{ face }, { face, prime: true }]);
const MAX_SEARCH_DEPTH = 7;
const SEARCH_TIMEOUT_MS = 2500;
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
  if (!SEARCH_FACES.includes(face)) return [];
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

async function solveWithKociemba(cubeState: CubeState): Promise<SolveSearchResult> {
  const startedAt = performance.now();
  const Cube = await loadCubeJs();
  const cube = Cube.fromString(cubeToKociembaFacelets(cubeState));
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

function solvedSignatureFrom(cubeState: CubeState): string {
  return FACE_ORDER
    .map((face) => cubeState[face][4].color[0].repeat(9))
    .join('');
}

function mismatchCount(signature: string, target: string): number {
  let mismatches = 0;
  for (let index = 0; index < signature.length; index += 1) {
    if (signature[index] !== target[index]) mismatches += 1;
  }
  return mismatches;
}

function lowerBoundMoves(cube: CubeState, target: string): number {
  // A quarter turn can move at most 20 stickers, so this is an admissible but
  // intentionally simple lower bound for the browser-side IDDFS solver.
  return Math.ceil(mismatchCount(cubeToCompactString(cube), target) / 20);
}

function shouldSkipMove(move: Move, previousMove: Move | null): boolean {
  return Boolean(previousMove && previousMove.face === move.face && previousMove.prime !== move.prime);
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
    return await solveWithKociemba(cubeState);
  } catch (error) {
    console.warn(
      'Kociemba solver failed, falling back to bounded search:',
      error instanceof Error ? error.message : error
    );
  }

  const target = solvedSignatureFrom(cubeState);
  const startedAt = performance.now();
  let nodesExplored = 0;
  let timedOut = false;

  const search = (
    cube: CubeState,
    depthRemaining: number,
    path: Move[],
    previousMove: Move | null,
    seen: Set<string>
  ): Move[] | null => {
    nodesExplored += 1;
    const signature = cubeToCompactString(cube);
    if (signature === target) return path;
    if (performance.now() - startedAt > SEARCH_TIMEOUT_MS) {
      timedOut = true;
      return null;
    }
    if (depthRemaining === 0) return null;
    if (lowerBoundMoves(cube, target) > depthRemaining) return null;

    for (const move of SEARCH_MOVES) {
      if (shouldSkipMove(move, previousMove)) continue;
      const nextCube = applyMove(cube, move);
      const nextSignature = cubeToCompactString(nextCube);
      if (seen.has(nextSignature)) continue;
      seen.add(nextSignature);
      const result = search(nextCube, depthRemaining - 1, [...path, move], move, seen);
      if (result) return result;
      seen.delete(nextSignature);
      if (timedOut) return null;
    }
    return null;
  };

  for (let depth = lowerBoundMoves(cubeState, target); depth <= MAX_SEARCH_DEPTH; depth += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    const seen = new Set([cubeToCompactString(cubeState)]);
    const result = search(cubeState, depth, [], null, seen);
    if (result) {
      return {
        moves: result,
        success: true,
        message: `Search solver found ${result.length} moves: ${result.map(moveToString).join(' ')}.`,
        nodesExplored,
        depthReached: depth
      };
    }
    if (timedOut) break;
  }

  return {
    moves: [],
    success: false,
    message: timedOut
      ? `Search timed out after ${nodesExplored.toLocaleString()} nodes. Try a smaller scramble or use the generated scrambles for now.`
      : `Kociemba could not solve this state, and fallback search found no solution up to depth ${MAX_SEARCH_DEPTH}. Check physical validity/parity.`,
    nodesExplored,
    depthReached: MAX_SEARCH_DEPTH
  };
}

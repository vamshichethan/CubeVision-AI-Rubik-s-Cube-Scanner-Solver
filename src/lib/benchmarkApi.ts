import { createSolvedCube } from './cubeState';
import { applyMove, applyMoves, cubeToCompactString, inverseMoves, moveToString, parseMoves } from './moves';
import { solveCube } from './solverApi';
import type { CubeState, Move } from '../types/cube';
import type { BenchmarkAlgorithm, BenchmarkDifficulty, BenchmarkReport, BenchmarkResult } from '../types/benchmark';

const SCRAMBLES: Record<BenchmarkDifficulty, string> = {
  Easy: "R U R' F",
  Medium: "R U R' F D L'",
  Hard: "R U R' F D L' B U"
};

const ALL_MOVES = parseMoves("R R' L L' U U' D D' F F' B B'");
const HARD_NODE_LIMIT = 180000;

type SearchStats = {
  nodesExplored: number;
  maxDepthReached: number;
  peakFrontier: number;
  timedOut: boolean;
};

type SearchOutput = {
  success: boolean;
  solution: Move[];
  stats: SearchStats;
  notes: string;
};

function heuristic(cube: CubeState, target: string): number {
  const signature = cubeToCompactString(cube);
  let mismatches = 0;
  for (let index = 0; index < signature.length; index += 1) {
    if (signature[index] !== target[index]) mismatches += 1;
  }
  return Math.ceil(mismatches / 20);
}

function isReverse(a: Move, b: Move): boolean {
  return a.face === b.face && Boolean(a.prime) !== Boolean(b.prime);
}

function estimateMemoryMB(peakFrontier: number): number {
  return Math.max(0.1, (peakFrontier * 96) / (1024 * 1024));
}

function timedOut(startedAt: number, timeoutMs: number): boolean {
  return performance.now() - startedAt > timeoutMs;
}

function makeResult(
  algorithmName: BenchmarkAlgorithm,
  output: SearchOutput,
  timeTakenMs: number
): BenchmarkResult {
  return {
    algorithmName,
    success: output.success,
    solutionLength: output.success ? output.solution.length : 0,
    timeTakenMs,
    memoryUsedMB: estimateMemoryMB(output.stats.peakFrontier),
    nodesExplored: output.stats.nodesExplored,
    maxDepthReached: output.stats.maxDepthReached,
    solution: output.success ? output.solution.map(moveToString) : [],
    notes: output.notes
  };
}

function bfs(start: CubeState, target: string, maxDepth: number, timeoutMs: number): SearchOutput {
  const startedAt = performance.now();
  const stats: SearchStats = { nodesExplored: 0, maxDepthReached: 0, peakFrontier: 1, timedOut: false };
  const queue: Array<{ cube: CubeState; path: Move[]; previous: Move | null }> = [{ cube: start, path: [], previous: null }];
  const visited = new Set([cubeToCompactString(start)]);

  while (queue.length > 0) {
    if (timedOut(startedAt, timeoutMs) || stats.nodesExplored > HARD_NODE_LIMIT) {
      stats.timedOut = true;
      break;
    }
    const item = queue.shift();
    if (!item) break;
    stats.nodesExplored += 1;
    stats.maxDepthReached = Math.max(stats.maxDepthReached, item.path.length);
    const signature = cubeToCompactString(item.cube);
    if (signature === target) {
      return { success: true, solution: item.path, stats, notes: 'Real BFS over cube states; complete and shortest within depth limit.' };
    }
    if (item.path.length >= maxDepth) continue;

    for (const move of ALL_MOVES) {
      if (item.previous && isReverse(move, item.previous)) continue;
      const nextCube = applyMove(item.cube, move);
      const nextSignature = cubeToCompactString(nextCube);
      if (visited.has(nextSignature)) continue;
      visited.add(nextSignature);
      queue.push({ cube: nextCube, path: [...item.path, move], previous: move });
    }
    stats.peakFrontier = Math.max(stats.peakFrontier, queue.length + visited.size);
  }

  return {
    success: false,
    solution: [],
    stats,
    notes: stats.timedOut ? 'BFS stopped by timeout/node cap before finding a solution.' : 'BFS did not find a solution within the depth limit.'
  };
}

function depthLimitedSearch(
  cube: CubeState,
  target: string,
  depthRemaining: number,
  timeoutMs: number,
  startedAt: number,
  stats: SearchStats,
  path: Move[],
  previous: Move | null,
  seen: Set<string>,
  useHeuristic: boolean
): Move[] | null {
  stats.nodesExplored += 1;
  stats.maxDepthReached = Math.max(stats.maxDepthReached, path.length);
  if (timedOut(startedAt, timeoutMs) || stats.nodesExplored > HARD_NODE_LIMIT) {
    stats.timedOut = true;
    return null;
  }

  const signature = cubeToCompactString(cube);
  if (signature === target) return path;
  if (depthRemaining === 0) return null;
  if (useHeuristic && heuristic(cube, target) > depthRemaining) return null;

  for (const move of ALL_MOVES) {
    if (previous && isReverse(move, previous)) continue;
    const nextCube = applyMove(cube, move);
    const nextSignature = cubeToCompactString(nextCube);
    if (seen.has(nextSignature)) continue;
    seen.add(nextSignature);
    stats.peakFrontier = Math.max(stats.peakFrontier, seen.size);
    const result = depthLimitedSearch(nextCube, target, depthRemaining - 1, timeoutMs, startedAt, stats, [...path, move], move, seen, useHeuristic);
    if (result) return result;
    seen.delete(nextSignature);
    if (stats.timedOut) return null;
  }
  return null;
}

function iddfs(start: CubeState, target: string, maxDepth: number, timeoutMs: number, useHeuristic = false): SearchOutput {
  const startedAt = performance.now();
  const stats: SearchStats = { nodesExplored: 0, maxDepthReached: 0, peakFrontier: 1, timedOut: false };
  const lowerBound = useHeuristic ? heuristic(start, target) : 0;

  for (let depth = lowerBound; depth <= maxDepth; depth += 1) {
    const seen = new Set([cubeToCompactString(start)]);
    const result = depthLimitedSearch(start, target, depth, timeoutMs, startedAt, stats, [], null, seen, useHeuristic);
    if (result) {
      return {
        success: true,
        solution: result,
        stats,
        notes: useHeuristic ? 'Real IDA*-style depth search with mismatch heuristic pruning.' : 'Real IDDFS depth-limited search over cube states.'
      };
    }
    if (stats.timedOut) break;
  }

  return {
    success: false,
    solution: [],
    stats,
    notes: stats.timedOut ? 'Search stopped by timeout/node cap.' : `No solution found up to depth ${maxDepth}.`
  };
}

function aStar(start: CubeState, target: string, maxDepth: number, timeoutMs: number): SearchOutput {
  const startedAt = performance.now();
  const stats: SearchStats = { nodesExplored: 0, maxDepthReached: 0, peakFrontier: 1, timedOut: false };
  const open: Array<{ cube: CubeState; path: Move[]; previous: Move | null; score: number }> = [
    { cube: start, path: [], previous: null, score: heuristic(start, target) }
  ];
  const bestDepth = new Map([[cubeToCompactString(start), 0]]);

  while (open.length > 0) {
    if (timedOut(startedAt, timeoutMs) || stats.nodesExplored > HARD_NODE_LIMIT) {
      stats.timedOut = true;
      break;
    }
    open.sort((a, b) => a.score - b.score);
    const item = open.shift();
    if (!item) break;
    stats.nodesExplored += 1;
    stats.maxDepthReached = Math.max(stats.maxDepthReached, item.path.length);
    const signature = cubeToCompactString(item.cube);
    if (signature === target) {
      return { success: true, solution: item.path, stats, notes: 'Real A* using mismatch/20 heuristic and a priority frontier.' };
    }
    if (item.path.length >= maxDepth) continue;

    for (const move of ALL_MOVES) {
      if (item.previous && isReverse(move, item.previous)) continue;
      const nextCube = applyMove(item.cube, move);
      const nextPath = [...item.path, move];
      const nextSignature = cubeToCompactString(nextCube);
      const knownDepth = bestDepth.get(nextSignature);
      if (knownDepth !== undefined && knownDepth <= nextPath.length) continue;
      bestDepth.set(nextSignature, nextPath.length);
      open.push({
        cube: nextCube,
        path: nextPath,
        previous: move,
        score: nextPath.length + heuristic(nextCube, target)
      });
    }
    stats.peakFrontier = Math.max(stats.peakFrontier, open.length + bestDepth.size);
  }

  return {
    success: false,
    solution: [],
    stats,
    notes: stats.timedOut ? 'A* stopped by timeout/node cap.' : `A* did not find a solution up to depth ${maxDepth}.`
  };
}

async function runAlgorithm(
  algorithm: BenchmarkAlgorithm,
  start: CubeState,
  target: string,
  scrambleDepth: number,
  timeoutMs: number
): Promise<BenchmarkResult> {
  const maxDepth = algorithm === 'BFS' ? Math.min(scrambleDepth, 6) : scrambleDepth + 1;
  const startedAt = performance.now();
  let output: SearchOutput;

  if (algorithm === 'BFS') {
    output = bfs(start, target, maxDepth, timeoutMs);
  } else if (algorithm === 'IDDFS') {
    output = iddfs(start, target, maxDepth, timeoutMs);
  } else if (algorithm === 'A*') {
    output = aStar(start, target, maxDepth, timeoutMs);
  } else if (algorithm === 'IDA*') {
    output = iddfs(start, target, maxDepth, timeoutMs, true);
  } else {
    const result = await solveCube(start);
    output = {
      success: result.success,
      solution: result.moves,
      stats: {
        nodesExplored: result.nodesExplored,
        maxDepthReached: result.depthReached,
        peakFrontier: Math.max(1, result.moves.length),
        timedOut: false
      },
      notes: result.message
    };
  }

  return makeResult(algorithm, output, performance.now() - startedAt);
}

function bestOf(results: BenchmarkResult[], selector: (result: BenchmarkResult) => number): string {
  const successful = results.filter((result) => result.success);
  if (successful.length === 0) return '-';
  return successful.reduce((best, item) => (selector(item) < selector(best) ? item : best), successful[0]).algorithmName;
}

export function createPendingBenchmarkReport(): BenchmarkReport {
  return {
    scramble: 'Click Run Benchmark',
    difficulty: 'Easy',
    results: [],
    best: { fastest: '-', shortest: '-', lowestMemory: '-' }
  };
}

export async function runBenchmark(
  difficulty: BenchmarkDifficulty,
  selectedAlgorithms: BenchmarkAlgorithm[],
  timeoutMs: number
): Promise<BenchmarkReport> {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  const scramble = SCRAMBLES[difficulty];
  const scrambleMoves = parseMoves(scramble);
  const solved = createSolvedCube();
  const start = applyMoves(solved, scrambleMoves);
  const target = cubeToCompactString(solved);
  const inverseSolution = inverseMoves(scrambleMoves).map(moveToString).join(' ');

  const results = await Promise.all(selectedAlgorithms.map(async (algorithm) => {
    const result = await runAlgorithm(algorithm, start, target, scrambleMoves.length, timeoutMs);
    if (result.success) {
      return { ...result, notes: `${result.notes} Expected inverse: ${inverseSolution}.` };
    }
    return result;
  }));

  return {
    scramble,
    difficulty,
    results,
    best: {
      fastest: bestOf(results, (result) => result.timeTakenMs),
      shortest: bestOf(results, (result) => result.solutionLength),
      lowestMemory: bestOf(results, (result) => result.memoryUsedMB)
    }
  };
}

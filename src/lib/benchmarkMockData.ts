import type { BenchmarkAlgorithm, BenchmarkDifficulty, BenchmarkReport, BenchmarkResult } from '../types/benchmark';

const BASE_SCRAMBLES: Record<BenchmarkDifficulty, string> = {
  Easy: "R U R' F D",
  Medium: "R U R' F D L' B U' R",
  Hard: "R U R' F D L' B U' R F' D B L U R' F"
};

const SOLUTION = ["D'", "F'", 'R', "U'", "R'"];

function result(
  algorithmName: BenchmarkAlgorithm,
  success: boolean,
  solutionLength: number,
  timeTakenMs: number,
  memoryUsedMB: number,
  nodesExplored: number,
  maxDepthReached: number,
  notes: string
): BenchmarkResult {
  return {
    algorithmName,
    success,
    solutionLength,
    timeTakenMs,
    memoryUsedMB,
    nodesExplored,
    maxDepthReached,
    solution: success ? SOLUTION.slice(0, solutionLength || SOLUTION.length) : [],
    notes
  };
}

export function makeMockBenchmarkReport(
  difficulty: BenchmarkDifficulty,
  selectedAlgorithms: BenchmarkAlgorithm[],
  timeoutMs: number
): BenchmarkReport {
  const depth = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 9 : 16;
  const allResults: BenchmarkResult[] = [
    result('BFS', depth <= 6, depth <= 6 ? 5 : 0, depth <= 6 ? 34.2 : timeoutMs, depth <= 6 ? 12.6 : 41.2, depth <= 6 ? 1540 : 250000, depth, 'Complete and optimal for shallow scrambles, but memory-heavy.'),
    result('IDDFS', depth <= 12, depth <= 12 ? 5 : 0, depth <= 12 ? 18.7 : timeoutMs, 3.1, depth <= 12 ? 2310 : 250000, depth, 'Low memory, complete, repeats earlier depths.'),
    result('A*', true, 5, difficulty === 'Hard' ? 92.5 : 9.8, difficulty === 'Hard' ? 24.4 : 8.4, difficulty === 'Hard' ? 18200 : 640, depth, 'Heuristic-guided and fast, but stores frontier states.'),
    result('IDA*', true, 5, difficulty === 'Hard' ? 68.4 : 7.2, 2.9, difficulty === 'Hard' ? 14200 : 520, depth, 'Low-memory heuristic depth-bound search.'),
    result('Kociemba', true, 4, 2.1, 1.7, 120, depth, 'Practical two-phase Rubik’s Cube approach.')
  ].filter((item) => selectedAlgorithms.includes(item.algorithmName));

  const successful = allResults.filter((item) => item.success);
  const fastest = successful.reduce((best, item) => (item.timeTakenMs < best.timeTakenMs ? item : best), successful[0]);
  const shortest = successful.reduce((best, item) => (item.solutionLength < best.solutionLength ? item : best), successful[0]);
  const lowestMemory = successful.reduce((best, item) => (item.memoryUsedMB < best.memoryUsedMB ? item : best), successful[0]);

  return {
    scramble: BASE_SCRAMBLES[difficulty],
    difficulty,
    results: allResults,
    best: {
      fastest: fastest?.algorithmName ?? '-',
      shortest: shortest?.algorithmName ?? '-',
      lowestMemory: lowestMemory?.algorithmName ?? '-'
    }
  };
}

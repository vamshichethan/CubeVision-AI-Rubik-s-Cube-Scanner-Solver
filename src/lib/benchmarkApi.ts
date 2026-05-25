import { makeMockBenchmarkReport } from './benchmarkMockData';
import type { BenchmarkAlgorithm, BenchmarkDifficulty, BenchmarkReport } from '../types/benchmark';

export async function runBenchmark(
  difficulty: BenchmarkDifficulty,
  selectedAlgorithms: BenchmarkAlgorithm[],
  timeoutMs: number
): Promise<BenchmarkReport> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  return makeMockBenchmarkReport(difficulty, selectedAlgorithms, timeoutMs);
}

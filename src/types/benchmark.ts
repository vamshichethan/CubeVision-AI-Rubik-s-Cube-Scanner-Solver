export type BenchmarkDifficulty = 'Easy' | 'Medium' | 'Hard';
export type BenchmarkAlgorithm = 'BFS' | 'IDDFS' | 'A*' | 'IDA*' | 'Kociemba';

export type BenchmarkResult = {
  algorithmName: BenchmarkAlgorithm;
  success: boolean;
  solutionLength: number;
  timeTakenMs: number;
  memoryUsedMB: number;
  nodesExplored: number;
  maxDepthReached: number;
  solution: string[];
  notes: string;
};

export type BenchmarkBest = {
  fastest: string;
  shortest: string;
  lowestMemory: string;
};

export type BenchmarkReport = {
  scramble: string;
  difficulty: BenchmarkDifficulty;
  results: BenchmarkResult[];
  best: BenchmarkBest;
};

import { useState } from 'react';
import { AlgorithmNotes } from '../components/Benchmark/AlgorithmNotes';
import { BenchmarkCharts } from '../components/Benchmark/BenchmarkCharts';
import { BenchmarkTable } from '../components/Benchmark/BenchmarkTable';
import { ScrambleControlPanel } from '../components/Benchmark/ScrambleControlPanel';
import { SolutionViewer } from '../components/Benchmark/SolutionViewer';
import { makeMockBenchmarkReport } from '../lib/benchmarkMockData';
import { runBenchmark } from '../lib/benchmarkApi';
import type { BenchmarkAlgorithm, BenchmarkDifficulty, BenchmarkReport } from '../types/benchmark';

type Props = {
  onSendSolution: (moves: string[]) => void;
};

export function BenchmarkDashboard({ onSendSolution }: Props) {
  const [difficulty, setDifficulty] = useState<BenchmarkDifficulty>('Easy');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<BenchmarkAlgorithm[]>(['BFS', 'IDDFS', 'A*', 'IDA*', 'Kociemba']);
  const [timeoutMs, setTimeoutMs] = useState(1500);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<BenchmarkReport>(() => makeMockBenchmarkReport('Easy', ['BFS', 'IDDFS', 'A*', 'IDA*', 'Kociemba'], 1500));

  const handleRun = async () => {
    setRunning(true);
    try {
      setReport(await runBenchmark(difficulty, selectedAlgorithms, timeoutMs));
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-89px)] max-w-[1800px] p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Benchmark Dashboard</h2>
          <p className="text-sm text-slate-600">Compare BFS, IDDFS, A*, IDA*, and Kociemba on the same scramble.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <strong>Scramble:</strong> {report.scramble}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <ScrambleControlPanel
            difficulty={difficulty}
            selectedAlgorithms={selectedAlgorithms}
            timeoutMs={timeoutMs}
            running={running}
            onDifficultyChange={setDifficulty}
            onAlgorithmsChange={setSelectedAlgorithms}
            onTimeoutChange={setTimeoutMs}
            onRun={handleRun}
          />
          <SolutionViewer report={report} onSendSolution={onSendSolution} />
        </div>
        <div className="space-y-4">
          <BenchmarkTable results={report.results} />
          <BenchmarkCharts results={report.results} />
          <AlgorithmNotes />
        </div>
      </div>
    </main>
  );
}

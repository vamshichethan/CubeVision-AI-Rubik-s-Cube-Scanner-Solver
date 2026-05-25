import { Play, Shuffle } from 'lucide-react';
import type { BenchmarkAlgorithm, BenchmarkDifficulty } from '../../types/benchmark';

const ALGORITHMS: BenchmarkAlgorithm[] = ['BFS', 'IDDFS', 'A*', 'IDA*', 'Kociemba'];
const DIFFICULTIES: BenchmarkDifficulty[] = ['Easy', 'Medium', 'Hard'];

type Props = {
  difficulty: BenchmarkDifficulty;
  selectedAlgorithms: BenchmarkAlgorithm[];
  timeoutMs: number;
  running: boolean;
  onDifficultyChange: (difficulty: BenchmarkDifficulty) => void;
  onAlgorithmsChange: (algorithms: BenchmarkAlgorithm[]) => void;
  onTimeoutChange: (timeoutMs: number) => void;
  onRun: () => void;
};

export function ScrambleControlPanel({
  difficulty,
  selectedAlgorithms,
  timeoutMs,
  running,
  onDifficultyChange,
  onAlgorithmsChange,
  onTimeoutChange,
  onRun
}: Props) {
  const toggleAlgorithm = (algorithm: BenchmarkAlgorithm) => {
    if (selectedAlgorithms.includes(algorithm)) {
      onAlgorithmsChange(selectedAlgorithms.filter((item) => item !== algorithm));
    } else {
      onAlgorithmsChange([...selectedAlgorithms, algorithm]);
    }
  };

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Shuffle className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-950">Scramble Control</h2>
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-700">Difficulty</label>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {DIFFICULTIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onDifficultyChange(item)}
            className={[
              'focus-ring rounded-md border px-3 py-2 text-sm font-semibold',
              difficulty === item ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'
            ].join(' ')}
          >
            {item}
          </button>
        ))}
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-700">Algorithms</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {ALGORITHMS.map((algorithm) => (
          <label key={algorithm} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={selectedAlgorithms.includes(algorithm)}
              onChange={() => toggleAlgorithm(algorithm)}
            />
            {algorithm}
          </label>
        ))}
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-700">Timeout: {timeoutMs} ms</label>
      <input
        type="range"
        min={250}
        max={5000}
        step={250}
        value={timeoutMs}
        onChange={(event) => onTimeoutChange(Number(event.currentTarget.value))}
        className="mb-4 w-full"
      />

      <button
        type="button"
        disabled={running || selectedAlgorithms.length === 0}
        onClick={onRun}
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Play className="h-4 w-4" />
        {running ? 'Running...' : 'Run Benchmark'}
      </button>
    </section>
  );
}

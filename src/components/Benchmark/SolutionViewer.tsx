import { Send } from 'lucide-react';
import type { BenchmarkReport } from '../../types/benchmark';

type Props = {
  report: BenchmarkReport;
  onSendSolution: (moves: string[]) => void;
};

export function SolutionViewer({ report, onSendSolution }: Props) {
  const shortest = report.results
    .filter((result) => result.success)
    .sort((a, b) => a.solutionLength - b.solutionLength)[0];

  return (
    <section className="panel rounded-lg p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-950">Solution Viewer</h2>
      <div className="mb-4 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-md bg-slate-50 p-3">
          <span className="block text-slate-500">Fastest</span>
          <strong>{report.best.fastest}</strong>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <span className="block text-slate-500">Shortest</span>
          <strong>{report.best.shortest}</strong>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <span className="block text-slate-500">Lowest Memory</span>
          <strong>{report.best.lowestMemory}</strong>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-sm font-semibold text-slate-700">Best move sequence</div>
        <div className="flex flex-wrap gap-1.5">
          {(shortest?.solution ?? []).map((move, index) => (
            <span key={`${move}-${index}`} className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-slate-800">
              {move}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!shortest}
        onClick={() => onSendSolution(shortest?.solution ?? [])}
        className="focus-ring flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
      >
        <Send className="h-4 w-4" />
        Send to 3D Visualizer
      </button>
    </section>
  );
}

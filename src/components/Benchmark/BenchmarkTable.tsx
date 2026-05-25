import type { BenchmarkResult } from '../../types/benchmark';

type Props = {
  results: BenchmarkResult[];
};

export function BenchmarkTable({ results }: Props) {
  return (
    <section className="panel overflow-hidden rounded-lg">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-950">Algorithm Comparison</h2>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Algorithm</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Solution Length</th>
              <th className="px-4 py-3">Time Taken</th>
              <th className="px-4 py-3">Memory Used</th>
              <th className="px-4 py-3">Nodes Explored</th>
              <th className="px-4 py-3">Max Depth</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.algorithmName} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-950">{result.algorithmName}</td>
                <td className="px-4 py-3">
                  <span className={result.success ? 'text-emerald-700' : 'text-rose-700'}>
                    {result.success ? 'OK' : 'Failed'}
                  </span>
                </td>
                <td className="px-4 py-3">{result.solutionLength}</td>
                <td className="px-4 py-3">{result.timeTakenMs.toFixed(1)} ms</td>
                <td className="px-4 py-3">{result.memoryUsedMB.toFixed(1)} MB</td>
                <td className="px-4 py-3">{result.nodesExplored.toLocaleString()}</td>
                <td className="px-4 py-3">{result.maxDepthReached}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

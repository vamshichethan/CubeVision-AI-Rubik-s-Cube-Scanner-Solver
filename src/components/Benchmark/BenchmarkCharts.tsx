import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { BenchmarkResult } from '../../types/benchmark';

type Props = {
  results: BenchmarkResult[];
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel h-72 rounded-lg p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

export function BenchmarkCharts({ results }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Time Taken by Algorithm">
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="algorithmName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="timeTakenMs" name="Time (ms)" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Solution Length">
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="algorithmName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="solutionLength" name="Moves" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Nodes Explored">
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="algorithmName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="nodesExplored" name="Nodes" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Memory Usage">
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="algorithmName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="memoryUsedMB" name="Memory (MB)" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

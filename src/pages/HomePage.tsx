import {
  ArrowRight,
  Activity,
  BarChart3,
  Camera,
  CheckCircle2,
  Cuboid,
  PlayCircle,
  ScanLine,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import type { AppPage } from '../components/Layout/Navbar';

type Props = {
  validationValid: boolean;
  moveCount: number;
  solverMessage: string;
  onNavigate: (page: AppPage) => void;
};

const workflows: Array<{
  title: string;
  description: string;
  page: AppPage;
  icon: typeof Cuboid;
  action: string;
}> = [
  {
    title: 'Solve Workspace',
    description: 'Edit the cube, inspect the 3D model, validate state, and step through a solution.',
    page: 'workspace',
    icon: Cuboid,
    action: 'Open solver'
  },
  {
    title: 'Camera Input',
    description: 'Scan six faces with live camera or image upload, then correct low-confidence stickers.',
    page: 'scanner',
    icon: Camera,
    action: 'Scan cube'
  },
  {
    title: 'Benchmark Lab',
    description: 'Compare BFS, IDDFS, A*, IDA*, and Kociemba-style runners on the same scramble.',
    page: 'benchmarks',
    icon: BarChart3,
    action: 'View metrics'
  },
  {
    title: 'Recovery Coach',
    description: 'Verify real-world moves, detect mismatches, and recalculate the remaining sequence.',
    page: 'recovery',
    icon: ShieldAlert,
    action: 'Check moves'
  }
];

const cubeTiles = [
  '#ffffff',
  '#2563eb',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#ffffff',
  '#f59e0b',
  '#ef4444',
  '#2563eb',
  '#10b981',
  '#ffffff',
  '#f59e0b',
  '#2563eb',
  '#10b981',
  '#ef4444',
  '#ffffff'
];

const miniCubeTiles = ['bg-white', 'bg-blue-500', 'bg-amber-400', 'bg-red-500', 'bg-emerald-500', 'bg-orange-500'];

export function HomePage({ validationValid, moveCount, solverMessage, onNavigate }: Props) {
  return (
    <main className="mx-auto min-h-[calc(100vh-89px)] max-w-[1800px] p-4">
      <section className="home-hero overflow-hidden rounded-lg">
        <div className="grid min-h-[620px] gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_500px] lg:p-10 xl:p-12">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/14 bg-white/10 px-3 py-1.5 text-sm font-semibold text-cyan-100 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-300" />
                CubeVision AI command center
              </div>
              <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
                A sharper way to scan, solve, and trust every cube move.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Capture the cube, correct uncertain stickers, inspect the state in 3D, and play a
                verified solution without leaving the workspace.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('scanner')}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-300"
                >
                  <ScanLine className="h-4 w-4" />
                  Start scanning
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('workspace')}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-white/18 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 backdrop-blur transition hover:bg-white/16"
                >
                  <PlayCircle className="h-4 w-4" />
                  Open solver
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="hero-stat">
                  <span>Cube state</span>
                  <strong className={validationValid ? 'text-emerald-300' : 'text-amber-300'}>
                    {validationValid ? 'Valid' : 'Review'}
                  </strong>
                </div>
                <div className="hero-stat">
                  <span>Loaded moves</span>
                  <strong>{moveCount}</strong>
                </div>
                <div className="hero-stat">
                  <span>Mode</span>
                  <strong>Live</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[460px] items-center justify-center">
            <div className="absolute left-0 top-8 hidden rounded-md border border-white/12 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-950/30 backdrop-blur md:block">
              <div className="mb-1 flex items-center gap-2 text-cyan-200">
                <Activity className="h-4 w-4" />
                Solver status
              </div>
              <p className="max-w-[230px] text-slate-300">{solverMessage}</p>
            </div>

            <div className="hero-cube-stage" aria-hidden="true">
              <div className="hero-cube hero-cube-left">
                {cubeTiles.slice(0, 9).map((color, index) => (
                  <span key={`left-${color}-${index}`} style={{ background: color }} />
                ))}
              </div>
              <div className="hero-cube hero-cube-front">
                {cubeTiles.slice(4, 13).map((color, index) => (
                  <span key={`front-${color}-${index}`} style={{ background: color }} />
                ))}
              </div>
              <div className="hero-cube hero-cube-top">
                {cubeTiles.slice(7, 16).map((color, index) => (
                  <span key={`top-${color}-${index}`} style={{ background: color }} />
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 right-0 hidden w-[260px] rounded-md border border-white/12 bg-slate-950/55 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur md:block">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Live face map</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {miniCubeTiles.concat(miniCubeTiles, miniCubeTiles).map((tile, index) => (
                  <span key={`${tile}-${index}`} className={`h-6 rounded ${tile}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="workflow-panel rounded-lg p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-md bg-emerald-400/16 p-2 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recommended Live Flow</h3>
              <p className="text-sm leading-6 text-slate-300">Fast path from camera to verified playback.</p>
            </div>
          </div>
          <ol className="grid gap-2 text-sm text-slate-200">
            {[
              'Scan or upload six faces',
              'Correct highlighted stickers',
              'Send CubeState to the solver',
              'Animate and verify each move'
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.07] px-3 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-cyan-300 text-xs font-black text-slate-950 shadow-sm">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="focus-ring rounded-md bg-white px-3 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-50"
            >
              Start with scanner
            </button>
            <button
              type="button"
              onClick={() => onNavigate('workspace')}
              className="focus-ring rounded-md border border-white/[0.14] bg-white/[0.08] px-3 py-2.5 text-sm font-bold text-white hover:bg-white/[0.14]"
            >
              Open solver
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflows.map(({ title, description, page, icon: Icon, action }, index) => (
            <button
              key={title}
              type="button"
              onClick={() => onNavigate(page)}
              className="feature-card focus-ring group rounded-lg p-5 text-left transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className={`feature-accent feature-accent-${index}`} />
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-md bg-slate-950 p-2 text-white shadow-lg shadow-slate-950/20 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-950" />
              </div>
              <h3 className="text-lg font-black text-slate-950">{title}</h3>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{description}</p>
              <div className="mt-4 text-sm font-black text-slate-950">{action}</div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

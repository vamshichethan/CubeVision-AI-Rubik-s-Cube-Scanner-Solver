import {
  ArrowRight,
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

export function HomePage({ validationValid, moveCount, solverMessage, onNavigate }: Props) {
  return (
    <main className="mx-auto min-h-[calc(100vh-89px)] max-w-[1800px] p-4">
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(680px,1fr)_430px]">
        <div className="panel overflow-hidden rounded-lg">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px] lg:p-8">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                  <Sparkles className="h-4 w-4" />
                  CubeVision AI command center
                </div>
                <h2 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 lg:text-5xl">
                  Your Rubik’s cube assistant, arranged for real work.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Scan faces, correct colors, inspect the cube in 3D, verify each move, and compare
                  algorithms without jumping through a long documentation page.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('scanner')}
                  className="focus-ring inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <ScanLine className="h-4 w-4" />
                  Start scanning
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('workspace')}
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <PlayCircle className="h-4 w-4" />
                  Open solver
                </button>
              </div>
            </div>

            <div className="grid gap-3 self-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-500">Cube State</div>
                <div className={validationValid ? 'text-2xl font-bold text-emerald-700' : 'text-2xl font-bold text-amber-700'}>
                  {validationValid ? 'Valid' : 'Needs review'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-500">Loaded Moves</div>
                <div className="text-2xl font-bold text-slate-950">{moveCount}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-500">Solver Status</div>
                <p className="text-sm leading-6 text-slate-700">{solverMessage}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="panel rounded-lg p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Best Demo Flow</h3>
                <p className="text-sm text-slate-600">A clean path through the app.</p>
              </div>
            </div>
            <ol className="grid gap-2 text-sm text-slate-700">
              {[
                'Scan or upload six faces',
                'Correct highlighted stickers',
                'Send CubeState to the solver',
                'Animate and verify each move'
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold text-blue-700 shadow-sm">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onNavigate('recovery')}
              className="panel focus-ring rounded-lg p-4 text-left hover:border-amber-300"
            >
              <ShieldAlert className="mb-3 h-5 w-5 text-amber-700" />
              <div className="text-sm font-bold text-slate-950">Mistake recovery</div>
              <div className="mt-1 text-xs leading-5 text-slate-600">Check a physical move before continuing.</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('benchmarks')}
              className="panel focus-ring rounded-lg p-4 text-left hover:border-blue-300"
            >
              <BarChart3 className="mb-3 h-5 w-5 text-blue-700" />
              <div className="text-sm font-bold text-slate-950">Benchmark lab</div>
              <div className="mt-1 text-xs leading-5 text-slate-600">Compare solver speed and search cost.</div>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workflows.map(({ title, description, page, icon: Icon, action }) => (
          <button
            key={title}
            type="button"
            onClick={() => onNavigate(page)}
            className="panel focus-ring group rounded-lg p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-md bg-slate-100 p-2 text-slate-800 group-hover:bg-blue-100 group-hover:text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-4 text-sm font-semibold text-blue-700">{action}</div>
          </button>
        ))}
      </section>
    </main>
  );
}

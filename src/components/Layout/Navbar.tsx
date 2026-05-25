import { BarChart3, Camera, Cuboid, Home, ShieldAlert } from 'lucide-react';

export type AppPage = 'home' | 'workspace' | 'scanner' | 'benchmarks' | 'recovery';

type Props = {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
};

export function Navbar({ currentPage, onNavigate }: Props) {
  const links = [
    { page: 'home' as const, label: 'Home', icon: Home },
    { page: 'workspace' as const, label: 'Solver', icon: Cuboid },
    { page: 'scanner' as const, label: 'Scanner', icon: Camera },
    { page: 'recovery' as const, label: 'Recovery', icon: ShieldAlert },
    { page: 'benchmarks' as const, label: 'Benchmarks', icon: BarChart3 }
  ];

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Cuboid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-normal text-slate-950">CubeVision AI</h1>
            <p className="text-sm text-slate-600">Scan. Solve. Verify. Benchmark.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">
            {links.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                className={[
                  'focus-ring flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold',
                  currentPage === page ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
            Phase 7
          </div>
        </div>
      </div>
    </header>
  );
}

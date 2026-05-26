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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-lg shadow-slate-950/12">
            <Cuboid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-normal text-slate-950 sm:text-xl">CubeVision AI</h1>
            <p className="text-xs font-medium text-slate-500 sm:text-sm">Scan. Solve. Verify. Benchmark.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <nav className="grid w-full grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50/90 p-1 shadow-sm sm:flex sm:w-auto sm:flex-wrap">
            {links.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                className={[
                  'focus-ring flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition sm:justify-start',
                  currentPage === page
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950'
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

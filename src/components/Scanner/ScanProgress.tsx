import type { ScannerFaceLabel } from '../../types/cube';

type Props = {
  savedFaces: ScannerFaceLabel[];
};

export function ScanProgress({ savedFaces }: Props) {
  const faces: ScannerFaceLabel[] = ['U', 'D', 'F', 'B', 'L', 'R'];

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-950">Scan Progress</h2>
        <span className="text-sm font-semibold text-slate-600">{savedFaces.length} / 6</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {faces.map((face) => (
          <div
            key={face}
            className={[
              'rounded-md border px-3 py-2 text-center text-sm font-semibold',
              savedFaces.includes(face)
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-500'
            ].join(' ')}
          >
            {face}
          </div>
        ))}
      </div>
    </section>
  );
}

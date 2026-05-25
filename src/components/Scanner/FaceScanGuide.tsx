import type { ScannerFaceLabel } from '../../types/cube';

const GUIDE: Record<ScannerFaceLabel, string> = {
  U: 'Scan WHITE center face',
  D: 'Scan YELLOW center face',
  F: 'Scan GREEN center face',
  B: 'Scan BLUE center face',
  L: 'Scan ORANGE center face',
  R: 'Scan RED center face'
};

type Props = {
  face: ScannerFaceLabel;
  onFaceChange: (face: ScannerFaceLabel) => void;
};

export function FaceScanGuide({ face, onFaceChange }: Props) {
  const faces: ScannerFaceLabel[] = ['U', 'D', 'F', 'B', 'L', 'R'];

  return (
    <section className="panel rounded-lg p-4">
      <h2 className="mb-1 text-lg font-semibold text-slate-950">Face Guide</h2>
      <p className="mb-3 text-sm text-slate-600">{GUIDE[face]}</p>
      <div className="grid grid-cols-6 gap-2">
        {faces.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFaceChange(item)}
            className={[
              'focus-ring rounded-md border px-3 py-2 text-sm font-semibold',
              face === item ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'
            ].join(' ')}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

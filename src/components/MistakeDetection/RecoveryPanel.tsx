import { RotateCcw, Wand2 } from 'lucide-react';
import type { MistakeDetectionResult } from '../../types/mistakeDetection';

type Props = {
  result: MistakeDetectionResult | null;
  onUndo: () => void;
  onRecalculate: () => void;
};

export function RecoveryPanel({ result, onUndo, onRecalculate }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-sm font-semibold text-slate-800">Suggested Action</div>
      <div className="mb-3 text-sm text-slate-600">{result?.suggestedAction ?? 'Verify a move first'}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!result || result.status === 'verified'}
          onClick={onUndo}
          className="focus-ring flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
          Undo Move
        </button>
        <button
          type="button"
          disabled={!result}
          onClick={onRecalculate}
          className="focus-ring flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          <Wand2 className="h-4 w-4" />
          Recalculate Solution
        </button>
      </div>
    </div>
  );
}

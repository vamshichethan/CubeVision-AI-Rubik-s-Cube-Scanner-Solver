import { AlertTriangle, CheckCircle2, ScanLine } from 'lucide-react';
import type { MistakeDetectionResult } from '../../types/mistakeDetection';

type Props = {
  result: MistakeDetectionResult | null;
};

export function MistakeAlert({ result }: Props) {
  if (!result) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        Run a scan verification to compare the expected state with the actual scanned state.
      </div>
    );
  }

  const isOk = result.status === 'verified';
  const Icon = isOk ? CheckCircle2 : result.status === 'low-confidence' ? ScanLine : AlertTriangle;
  const tone = isOk
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : result.status === 'low-confidence'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-rose-200 bg-rose-50 text-rose-800';

  return (
    <div className={`flex gap-3 rounded-lg border p-3 text-sm ${tone}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <strong className="block">{isOk ? 'Move verified' : 'Mismatch detected'}</strong>
        {result.message}
      </div>
    </div>
  );
}

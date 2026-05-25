type Props = {
  confidence: number;
};

export function ScanConfidenceBadge({ confidence }: Props) {
  const pct = Math.round(confidence * 100);
  const tone =
    confidence >= 0.85
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : confidence >= 0.7
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

  return <span className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${tone}`}>{pct}%</span>;
}

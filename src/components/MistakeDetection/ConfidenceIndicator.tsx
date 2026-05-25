type Props = {
  confidence: number;
};

export function ConfidenceIndicator({ confidence }: Props) {
  const percentage = Math.round(confidence * 100);
  const color = confidence >= 0.85 ? 'bg-emerald-600' : confidence >= 0.7 ? 'bg-amber-500' : 'bg-rose-600';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-600">Confidence</span>
        <strong className="text-slate-950">{percentage}%</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

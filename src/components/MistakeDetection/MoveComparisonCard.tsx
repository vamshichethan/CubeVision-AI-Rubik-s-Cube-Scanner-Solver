type Props = {
  expectedMove: string;
  detectedMove: string | null;
  mismatchedStickers: number;
  matchPercentage: number;
};

export function MoveComparisonCard({ expectedMove, detectedMove, mismatchedStickers, matchPercentage }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-md bg-slate-50 p-3">
        <span className="block text-sm text-slate-500">Expected Move</span>
        <strong className="text-xl text-slate-950">{expectedMove}</strong>
      </div>
      <div className="rounded-md bg-slate-50 p-3">
        <span className="block text-sm text-slate-500">Detected Move</span>
        <strong className="text-xl text-slate-950">{detectedMove ?? 'Unknown'}</strong>
      </div>
      <div className="rounded-md bg-slate-50 p-3">
        <span className="block text-sm text-slate-500">State Match</span>
        <strong className="text-xl text-slate-950">{Math.round(matchPercentage * 100)}%</strong>
        <span className="block text-xs text-slate-500">{mismatchedStickers} mismatched stickers</span>
      </div>
    </div>
  );
}

import { ShieldAlert } from 'lucide-react';
import { ScanVerificationPanel } from '../components/MistakeDetection/ScanVerificationPanel';
import type { CubeState, Move } from '../types/cube';

type Props = {
  referenceCube: CubeState | null;
  scannedCube: CubeState | null;
  expectedTimelineMove: Move | null;
  onOpenScanner: () => void;
  onUseRecalculatedSolution: (moves: Move[]) => void;
};

export function RecoveryPage({
  referenceCube,
  scannedCube,
  expectedTimelineMove,
  onOpenScanner,
  onUseRecalculatedSolution
}: Props) {
  return (
    <main className="mx-auto min-h-[calc(100vh-89px)] max-w-[1280px] p-4">
      <div className="mb-4 flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
          <ShieldAlert className="h-4 w-4" />
          Real-time mistake recovery
        </div>
        <h2 className="text-2xl font-bold text-slate-950">Verify the move the user actually performed</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Compare the expected virtual cube with the scanned physical cube, infer likely move mistakes,
          and load a recalculated continuation when needed.
        </p>
      </div>
      <ScanVerificationPanel
        referenceCube={referenceCube}
        scannedCube={scannedCube}
        expectedTimelineMove={expectedTimelineMove}
        onOpenScanner={onOpenScanner}
        onUseRecalculatedSolution={onUseRecalculatedSolution}
      />
    </main>
  );
}

import { Activity, Camera, CheckCircle2, Loader2, ScanSearch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cloneCube } from '../../lib/cubeState';
import { verifyMoveStep } from '../../lib/mistakeDetection';
import { applyMove, inverseMove, moveToString, parseMove } from '../../lib/moves';
import { solveCube } from '../../lib/solverApi';
import type { CubeState, Move } from '../../types/cube';
import type { MistakeDetectionResult } from '../../types/mistakeDetection';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { MistakeAlert } from './MistakeAlert';
import { MoveComparisonCard } from './MoveComparisonCard';
import { RecoveryPanel } from './RecoveryPanel';

const MOVE_TOKENS = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];

type Props = {
  referenceCube: CubeState | null;
  scannedCube: CubeState | null;
  expectedTimelineMove: Move | null;
  onOpenScanner: () => void;
  onUseRecalculatedSolution: (moves: Move[]) => void;
};

export function ScanVerificationPanel({
  referenceCube,
  scannedCube,
  expectedTimelineMove,
  onOpenScanner,
  onUseRecalculatedSolution
}: Props) {
  const [expectedMoveToken, setExpectedMoveToken] = useState("U'");
  const [result, setResult] = useState<MistakeDetectionResult | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const expectedMove = useMemo(() => parseMove(expectedMoveToken) ?? { face: 'U' as const, prime: true }, [expectedMoveToken]);
  const hasScannerSnapshot = Boolean(scannedCube && referenceCube);
  const canVerifyScannerMove = Boolean(referenceCube && scannedCube);

  useEffect(() => {
    if (expectedTimelineMove) {
      setExpectedMoveToken(moveToString(expectedTimelineMove));
    }
  }, [expectedTimelineMove]);

  const runVerification = () => {
    if (!referenceCube || !scannedCube) return;
    const previousState = cloneCube(referenceCube);
    const expectedState = applyMove(previousState, expectedMove);
    const actualState = scannedCube;
    const scanConfidence = 0.91;
    setResult(verifyMoveStep(previousState, expectedState, actualState, expectedMove, scanConfidence));
  };

  const recalculate = async () => {
    if (!result?.actualState) return;
    setIsRecalculating(true);
    try {
      const recalculated = await solveCube(result.actualState);
      const nextMoves = recalculated.success ? recalculated.moves : [];
      if (nextMoves.length) {
        onUseRecalculatedSolution(nextMoves);
      }
      if (result) {
        setResult({
          ...result,
          message: recalculated.success
            ? `Loaded real Kociemba recovery solution: ${nextMoves.map(moveToString).join(' ') || 'already solved'}.`
            : recalculated.message,
          suggestedAction: recalculated.success ? 'Continue with recalculated timeline' : 'Retake scan or manually correct cube'
        });
      }
    } finally {
      setIsRecalculating(false);
    }
  };

  const undoDetectedMove = () => {
    const detected = result?.detectedMove ? parseMove(result.detectedMove) : null;
    if (!detected) return;
    const undo = inverseMove(detected);
    onUseRecalculatedSolution([undo, expectedMove]);
    setResult((current) =>
      current
        ? {
            ...current,
            message: `Undo ${moveToString(detected)} with ${moveToString(undo)}, then perform ${moveToString(expectedMove)}.`,
            suggestedAction: 'Recovery sequence loaded'
          }
        : current
    );
  };

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-5 w-5 text-rose-600" />
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Real-Time Mistake Detection</h2>
          <p className="text-sm text-slate-600">Compare expected virtual state against scanned physical state.</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-sm font-semibold text-slate-800">Actual State Source</div>
        <div className={hasScannerSnapshot ? 'rounded-md border border-emerald-200 bg-emerald-50 p-3' : 'rounded-md border border-amber-200 bg-amber-50 p-3'}>
          <div className={hasScannerSnapshot ? 'font-semibold text-emerald-800' : 'font-semibold text-amber-800'}>
            {hasScannerSnapshot ? 'Latest scanner CubeState connected' : 'Real scan required'}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
          {hasScannerSnapshot
            ? 'Recovery will compare the previous solver state against the latest CubeState sent from Scanner.'
            : 'Go to Scanner, scan or manually enter all six faces, then press Send CubeState to Solver. Recovery will use that real scanned state.'}
          </p>
          {!hasScannerSnapshot && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="focus-ring mt-3 flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Camera className="h-4 w-4" />
              Open Scanner
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="mb-2 block text-sm font-medium text-slate-700">Expected move</label>
          {expectedTimelineMove && (
            <div className="mb-2 rounded-md border border-blue-200 bg-blue-50 p-2 text-xs font-semibold text-blue-800">
              Loaded from current solution timeline.
            </div>
          )}
          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {MOVE_TOKENS.map((move) => (
              <button
                key={move}
                type="button"
                onClick={() => setExpectedMoveToken(move)}
                className={[
                  'focus-ring rounded-md border px-2 py-1 text-sm font-semibold',
                  expectedMoveToken === move ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'
                ].join(' ')}
              >
                {move}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <MistakeAlert result={result} />
          {result && (
            <>
              <MoveComparisonCard
                expectedMove={result.expectedMove}
                detectedMove={result.detectedMove}
                mismatchedStickers={result.mismatchedStickers}
                matchPercentage={result.matchPercentage}
              />
              <ConfidenceIndicator confidence={result.confidence} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <RecoveryPanel
          result={result}
          onUndo={undoDetectedMove}
          onRecalculate={recalculate}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canVerifyScannerMove}
            onClick={runVerification}
            className="focus-ring flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ScanSearch className="h-4 w-4" />
            Verify Scanner Move
          </button>
          <button
            type="button"
            onClick={() => {
              setResult(null);
            }}
            className="focus-ring flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <CheckCircle2 className="h-4 w-4" />
            Reset
          </button>
          {isRecalculating && (
            <div className="col-span-2 flex items-center justify-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recalculating from scanned CubeState...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

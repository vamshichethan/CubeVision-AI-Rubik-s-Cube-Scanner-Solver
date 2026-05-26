import { Activity, CheckCircle2, ScanSearch, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cloneCube } from '../../lib/cubeState';
import { makeDemoMistake, verifyMoveStep } from '../../lib/mistakeDetection';
import { applyMove, inverseMove, moveToString, parseMove } from '../../lib/moves';
import type { CubeState, Move, MoveFace } from '../../types/cube';
import type { MistakeDetectionResult } from '../../types/mistakeDetection';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { MistakeAlert } from './MistakeAlert';
import { MoveComparisonCard } from './MoveComparisonCard';
import { RecoveryPanel } from './RecoveryPanel';

const MOVE_TOKENS = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];
const ACTUAL_OPTIONS = ['same', ...MOVE_TOKENS, 'low'] as const;
type ActualOption = (typeof ACTUAL_OPTIONS)[number];

type Props = {
  cubeState: CubeState;
  referenceCube: CubeState | null;
  scannedCube: CubeState | null;
  onUseRecalculatedSolution: (moves: Move[]) => void;
};

export function ScanVerificationPanel({ cubeState, referenceCube, scannedCube, onUseRecalculatedSolution }: Props) {
  const [expectedMoveToken, setExpectedMoveToken] = useState("U'");
  const [result, setResult] = useState<MistakeDetectionResult | null>(null);
  const [actualMoveToken, setActualMoveToken] = useState<ActualOption>('U');
  const [useScannerOutput, setUseScannerOutput] = useState(true);

  const expectedMove = useMemo(() => parseMove(expectedMoveToken) ?? { face: 'U' as const, prime: true }, [expectedMoveToken]);
  const hasScannerSnapshot = Boolean(scannedCube && referenceCube);

  const runVerification = () => {
    const previousState = cloneCube(useScannerOutput && referenceCube ? referenceCube : cubeState);
    const expectedState = applyMove(previousState, expectedMove);
    const actualMove =
      actualMoveToken === 'same'
        ? expectedMove
        : actualMoveToken === 'low'
          ? expectedMove
          : parseMove(actualMoveToken) ?? expectedMove;
    const actualState =
      useScannerOutput && scannedCube
        ? scannedCube
        : actualMoveToken === 'low'
          ? makeDemoMistake(previousState, expectedMove)
          : applyMove(previousState, actualMove);
    const scanConfidence = useScannerOutput && scannedCube ? 0.91 : actualMoveToken === 'low' ? 0.62 : 0.95;
    setResult(verifyMoveStep(previousState, expectedState, actualState, expectedMove, scanConfidence));
  };

  const recalculate = () => {
    const detected = result?.detectedMove ? parseMove(result.detectedMove) : null;
    const correction = detected ? [inverseMove(detected), expectedMove] : [expectedMove];
    onUseRecalculatedSolution(correction);
    if (result) {
      setResult({
        ...result,
        message: `Loaded recovery sequence: ${correction.map(moveToString).join(' ')}.`,
        suggestedAction: 'Continue with updated timeline'
      });
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
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!hasScannerSnapshot}
            onClick={() => setUseScannerOutput(true)}
            className={[
              'focus-ring rounded-md border px-3 py-2 text-left text-sm font-semibold',
              useScannerOutput && hasScannerSnapshot ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700',
              !hasScannerSnapshot ? 'cursor-not-allowed opacity-50' : ''
            ].join(' ')}
          >
            Latest scanner CubeState
          </button>
          <button
            type="button"
            onClick={() => setUseScannerOutput(false)}
            className={[
              'focus-ring rounded-md border px-3 py-2 text-left text-sm font-semibold',
              !useScannerOutput || !hasScannerSnapshot ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-700'
            ].join(' ')}
          >
            Manual simulation
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {hasScannerSnapshot
            ? 'Recovery will compare the previous solver state against the latest CubeState sent from Scanner.'
            : 'No complete scanner CubeState has been sent yet. Use Scanner, save all six faces, then send to solver.'}
        </p>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="mb-2 block text-sm font-medium text-slate-700">Expected move</label>
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

          <label className="mb-2 block text-sm font-medium text-slate-700">
            {useScannerOutput && hasScannerSnapshot ? 'Simulation disabled' : 'Actual scanned move'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {ACTUAL_OPTIONS.map((value) => {
              const label = value === 'same' ? 'Correct' : value === 'low' ? 'Low scan' : value;
              return (
              <button
                key={value}
                type="button"
                disabled={useScannerOutput && hasScannerSnapshot}
                onClick={() => setActualMoveToken(value)}
                className={[
                  'focus-ring rounded-md border px-2 py-1 text-center text-sm font-semibold',
                  actualMoveToken === value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-700',
                  useScannerOutput && hasScannerSnapshot ? 'cursor-not-allowed opacity-40' : ''
                ].join(' ')}
              >
                {label}
              </button>
            )})}
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
            onClick={runVerification}
            className="focus-ring flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <ScanSearch className="h-4 w-4" />
            Verify Move
          </button>
          <button
            type="button"
            onClick={() => {
              setActualMoveToken('same');
              setResult(null);
            }}
            className="focus-ring flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <CheckCircle2 className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const opposite = expectedMove.prime ? expectedMove.face : `${expectedMove.face}'`;
              setActualMoveToken(opposite as ActualOption);
              setResult(null);
            }}
            className="focus-ring col-span-2 flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Shuffle className="h-4 w-4" />
            Demo Wrong Move
          </button>
        </div>
      </div>
    </section>
  );
}

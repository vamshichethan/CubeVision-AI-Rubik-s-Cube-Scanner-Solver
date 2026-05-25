import { Activity, CheckCircle2, ScanSearch, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cloneCube } from '../../lib/cubeState';
import { makeDemoMistake, verifyMoveStep } from '../../lib/mistakeDetection';
import { applyMove, moveToString, parseMove } from '../../lib/moves';
import type { CubeState, Move } from '../../types/cube';
import type { MistakeDetectionResult } from '../../types/mistakeDetection';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { MistakeAlert } from './MistakeAlert';
import { MoveComparisonCard } from './MoveComparisonCard';
import { RecoveryPanel } from './RecoveryPanel';

const DEMO_MOVES = ["U'", 'R', 'F'];

type Props = {
  cubeState: CubeState;
  onUseRecalculatedSolution: (moves: Move[]) => void;
};

export function ScanVerificationPanel({ cubeState, onUseRecalculatedSolution }: Props) {
  const [expectedMoveToken, setExpectedMoveToken] = useState("U'");
  const [result, setResult] = useState<MistakeDetectionResult | null>(null);
  const [mode, setMode] = useState<'correct' | 'wrong' | 'low'>('wrong');

  const expectedMove = useMemo(() => parseMove(expectedMoveToken) ?? { face: 'U' as const, prime: true }, [expectedMoveToken]);

  const runVerification = () => {
    const previousState = cloneCube(cubeState);
    const expectedState = applyMove(previousState, expectedMove);
    const actualState =
      mode === 'correct'
        ? expectedState
        : mode === 'low'
          ? makeDemoMistake(previousState, expectedMove)
          : makeDemoMistake(previousState, expectedMove);
    const scanConfidence = mode === 'low' ? 0.62 : 0.93;
    setResult(verifyMoveStep(previousState, expectedState, actualState, expectedMove, scanConfidence));
  };

  const recalculate = () => {
    const updated = ['R', 'U', "R'", "U'", "F'"].map(parseMove).filter((move): move is Move => Boolean(move));
    onUseRecalculatedSolution(updated);
    if (result) {
      setResult({
        ...result,
        message: 'Recalculated optimized solution from scanned state. New remaining moves: 5.',
        suggestedAction: 'Continue with updated timeline'
      });
    }
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

      <div className="mb-4 grid gap-3 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="mb-2 block text-sm font-medium text-slate-700">Expected move</label>
          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {DEMO_MOVES.map((move) => (
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

          <label className="mb-2 block text-sm font-medium text-slate-700">Scan scenario</label>
          <div className="grid gap-1.5">
            {[
              ['correct', 'Correct move'],
              ['wrong', 'Wrong direction'],
              ['low', 'Low-confidence scan']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value as 'correct' | 'wrong' | 'low')}
                className={[
                  'focus-ring rounded-md border px-2 py-1 text-left text-sm',
                  mode === value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-700'
                ].join(' ')}
              >
                {label}
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
          onUndo={() => setResult(result ? { ...result, message: `Suggested undo: ${result.detectedMove ? moveToString({ ...expectedMove, prime: !expectedMove.prime }) : 'Retake scan first'}.` } : result)}
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
              setMode('correct');
              setResult(null);
            }}
            className="focus-ring flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <CheckCircle2 className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => setMode('wrong')}
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

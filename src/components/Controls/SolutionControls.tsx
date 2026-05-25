import { Pause, Play, RotateCcw, SkipBack, SkipForward, Wand2 } from 'lucide-react';
import { MoveTimeline } from './MoveTimeline';
import { moveToString } from '../../lib/moves';
import type { Move, MoveFace } from '../../types/cube';

type Props = {
  moves: Move[];
  currentIndex: number;
  isPlaying: boolean;
  isAnimating: boolean;
  isSolving: boolean;
  canSolve: boolean;
  onSolve: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  scrambleMoves: Move[];
  onGenerateScramble: (length: number) => void;
  onResetSolved: () => void;
  onLoadInverseSolution: () => void;
  onApplyManualMove: (move: Move) => void;
};

const QUICK_FACES: MoveFace[] = ['R', 'U', 'F', 'L', 'D', 'B'];

export function SolutionControls({
  moves,
  currentIndex,
  isPlaying,
  isAnimating,
  isSolving,
  canSolve,
  onSolve,
  onNext,
  onPrevious,
  onPlay,
  onPause,
  onReset,
  scrambleMoves,
  onGenerateScramble,
  onResetSolved,
  onLoadInverseSolution,
  onApplyManualMove
}: Props) {
  const hasMoves = moves.length > 0;
  const scrambleText = scrambleMoves.length ? scrambleMoves.map(moveToString).join(' ') : 'No scramble generated yet.';

  return (
    <aside className="panel flex max-h-[calc(100vh-116px)] min-h-0 flex-col rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Solution Player</h2>
        <p className="text-sm text-slate-600">Generate a scramble, then play the verified inverse solution.</p>
      </div>

      <button
        type="button"
        disabled={!canSolve || isSolving || isAnimating}
        onClick={onSolve}
        className="focus-ring mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Wand2 className="h-4 w-4" />
        {isSolving ? 'Solving...' : 'Solve'}
      </button>

      <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">Current move</span>
          <strong className="text-slate-950">
            {Math.min(currentIndex + (hasMoves ? 1 : 0), moves.length)} / {moves.length}
          </strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${moves.length ? (currentIndex / moves.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-5 gap-2">
        <button
          type="button"
          title="Previous move"
          disabled={!hasMoves || currentIndex === 0 || isAnimating || isPlaying}
          onClick={onPrevious}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <SkipBack className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          title="Next move"
          disabled={!hasMoves || currentIndex >= moves.length || isAnimating}
          onClick={onNext}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <SkipForward className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          title="Play"
          disabled={!hasMoves || currentIndex >= moves.length || isAnimating || isPlaying}
          onClick={onPlay}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <Play className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          title="Pause"
          disabled={!isPlaying}
          onClick={onPause}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <Pause className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          title="Reset playback"
          disabled={!hasMoves || isAnimating}
          onClick={onReset}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          <RotateCcw className="mx-auto h-4 w-4" />
        </button>
      </div>

      <MoveTimeline moves={moves} currentIndex={currentIndex} />

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Scramble Lab</h3>
            <p className="text-xs text-slate-600">Create test states for the visualizer.</p>
          </div>
          <button
            type="button"
            onClick={onResetSolved}
            disabled={isAnimating}
            className="focus-ring rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Solved
          </button>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {[8, 15, 25].map((length) => (
            <button
              key={length}
              type="button"
              onClick={() => onGenerateScramble(length)}
              disabled={isAnimating}
              className="focus-ring rounded-md bg-slate-950 px-2 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
            >
              {length} moves
            </button>
          ))}
        </div>

        <div className="mb-3 max-h-24 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 text-xs leading-5 text-slate-700">
          {scrambleText}
        </div>

        <button
          type="button"
          onClick={onLoadInverseSolution}
          disabled={!scrambleMoves.length || isAnimating}
          className="focus-ring mb-4 w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-40"
        >
          Load inverse solution
        </button>

        <h3 className="mb-2 text-sm font-bold text-slate-950">Quick Moves</h3>
        <div className="grid grid-cols-6 gap-1.5">
          {QUICK_FACES.map((face) => (
            <button
              key={face}
              type="button"
              onClick={() => onApplyManualMove({ face })}
              disabled={isAnimating}
              className="focus-ring rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
            >
              {face}
            </button>
          ))}
          {QUICK_FACES.map((face) => (
            <button
              key={`${face}'`}
              type="button"
              onClick={() => onApplyManualMove({ face, prime: true })}
              disabled={isAnimating}
              className="focus-ring rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
            >
              {face}'
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

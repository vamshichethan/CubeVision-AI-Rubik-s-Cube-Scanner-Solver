import { Pause, Play, RotateCcw, SkipBack, SkipForward, Wand2 } from 'lucide-react';
import { MoveTimeline } from './MoveTimeline';
import type { Move } from '../../types/cube';

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
};

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
  onReset
}: Props) {
  const hasMoves = moves.length > 0;

  return (
    <aside className="panel flex min-h-0 flex-col rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Solution Player</h2>
        <p className="text-sm text-slate-600">Mock solver today, WebAssembly-ready tomorrow.</p>
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
    </aside>
  );
}

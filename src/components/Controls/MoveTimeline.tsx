import { moveToString } from '../../lib/moves';
import type { Move } from '../../types/cube';

type Props = {
  moves: Move[];
  currentIndex: number;
};

export function MoveTimeline({ moves, currentIndex }: Props) {
  return (
    <div className="max-h-52 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="grid grid-cols-5 gap-1.5">
        {moves.map((move, index) => (
          <div
            key={`${moveToString(move)}-${index}`}
            className={[
              'rounded-md px-2 py-1 text-center text-sm font-semibold',
              index === currentIndex
                ? 'bg-blue-600 text-white'
                : index < currentIndex
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white text-slate-700'
            ].join(' ')}
          >
            {moveToString(move)}
          </div>
        ))}
      </div>
    </div>
  );
}

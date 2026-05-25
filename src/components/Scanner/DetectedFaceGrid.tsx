import { COLOR_HEX } from '../../lib/cubeState';
import type { ScannedSticker } from '../../types/cube';
import { ScanConfidenceBadge } from './ScanConfidenceBadge';

type Props = {
  stickers: ScannedSticker[];
  onStickerClick: (index: number) => void;
};

export function DetectedFaceGrid({ stickers, onStickerClick }: Props) {
  return (
    <section className="panel rounded-lg p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-950">Detected Face</h2>
      <div className="grid grid-cols-3 gap-2">
        {stickers.map((sticker, index) => (
          <button
            key={`${sticker.row}-${sticker.col}`}
            type="button"
            onClick={() => onStickerClick(index)}
            className={[
              'focus-ring aspect-square rounded-md border p-2 shadow-inner',
              sticker.confidence < 0.72 ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-300'
            ].join(' ')}
            style={{ backgroundColor: COLOR_HEX[sticker.color] }}
          >
            <ScanConfidenceBadge confidence={sticker.confidence} />
          </button>
        ))}
      </div>
    </section>
  );
}

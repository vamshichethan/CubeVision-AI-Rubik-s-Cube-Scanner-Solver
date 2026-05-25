import { COLOR_HEX, FACE_LABELS } from '../../lib/cubeState';
import type { CubeColor, FaceName } from '../../types/cube';

type Props = {
  face: FaceName;
  stickers: { color: CubeColor }[];
  selectedColor: CubeColor;
  onStickerChange: (face: FaceName, index: number, color: CubeColor) => void;
};

export function FaceGrid({ face, stickers, selectedColor, onStickerChange }: Props) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">{FACE_LABELS[face]}</h3>
        <span className="text-xs text-slate-500">3x3</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {stickers.map((sticker, index) => (
          <button
            key={`${face}-${index}`}
            type="button"
            title={`${FACE_LABELS[face]} sticker ${index + 1}`}
            aria-label={`${FACE_LABELS[face]} sticker ${index + 1}`}
            onClick={() => onStickerChange(face, index, selectedColor)}
            className="focus-ring aspect-square min-h-6 rounded border border-slate-400 shadow-inner transition-transform hover:scale-105"
            style={{ backgroundColor: COLOR_HEX[sticker.color] }}
          />
        ))}
      </div>
    </section>
  );
}

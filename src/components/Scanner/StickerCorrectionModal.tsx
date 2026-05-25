import { X } from 'lucide-react';
import { COLORS, COLOR_HEX } from '../../lib/cubeState';
import type { CubeColor } from '../../types/cube';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (color: CubeColor) => void;
};

export function StickerCorrectionModal({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Correct Sticker</h2>
          <button type="button" onClick={onClose} className="focus-ring rounded-md p-2 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onSelect(color);
                onClose();
              }}
              className="focus-ring rounded-md border border-slate-300 px-3 py-3 text-sm font-semibold capitalize"
            >
              <span
                className="mr-2 inline-block h-4 w-4 rounded border border-slate-300 align-[-2px]"
                style={{ backgroundColor: COLOR_HEX[color] }}
              />
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

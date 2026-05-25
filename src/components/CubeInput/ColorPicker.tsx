import { Check } from 'lucide-react';
import { COLORS, COLOR_HEX } from '../../lib/cubeState';
import type { CubeColor } from '../../types/cube';

type Props = {
  selectedColor: CubeColor;
  onSelectColor: (color: CubeColor) => void;
};

export function ColorPicker({ selectedColor, onSelectColor }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2" aria-label="Color picker">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select ${color}`}
          title={color}
          onClick={() => onSelectColor(color)}
          className="focus-ring flex aspect-square items-center justify-center rounded-md border border-slate-300"
          style={{ backgroundColor: COLOR_HEX[color] }}
        >
          {selectedColor === color && <Check className="h-4 w-4 text-slate-950 drop-shadow" />}
        </button>
      ))}
    </div>
  );
}

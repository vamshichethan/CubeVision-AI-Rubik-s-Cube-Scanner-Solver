import { RotateCcw, ShieldCheck } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { FaceGrid } from './FaceGrid';
import { COLORS, createSolvedCube, FACE_ORDER } from '../../lib/cubeState';
import { validateCube } from '../../lib/validators';
import type { CubeColor, CubeState, FaceName, ValidationResult } from '../../types/cube';

type Props = {
  cubeState: CubeState;
  selectedColor: CubeColor;
  validation: ValidationResult;
  onSelectedColorChange: (color: CubeColor) => void;
  onCubeChange: (cube: CubeState) => void;
  onValidate: () => void;
};

export function ManualInputPanel({
  cubeState,
  selectedColor,
  validation,
  onSelectedColorChange,
  onCubeChange,
  onValidate
}: Props) {
  const setSticker = (face: FaceName, index: number, color: CubeColor) => {
    onCubeChange({
      ...cubeState,
      [face]: cubeState[face].map((sticker, stickerIndex) =>
        stickerIndex === index ? { color } : sticker
      )
    });
  };

  const counts = validateCube(cubeState).counts;

  return (
    <aside className="panel flex max-h-[calc(100vh-104px)] min-h-0 flex-col rounded-lg p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Manual Input</h2>
          <p className="text-xs text-slate-600">Paint stickers and validate counts.</p>
        </div>
        <button
          type="button"
          title="Reset cube"
          onClick={() => onCubeChange(createSolvedCube())}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <ColorPicker selectedColor={selectedColor} onSelectColor={onSelectedColorChange} />

      <div className="mt-3 grid grid-cols-2 gap-2 overflow-auto pr-1">
        {FACE_ORDER.map((face) => (
          <FaceGrid
            key={face}
            face={face}
            stickers={cubeState[face]}
            selectedColor={selectedColor}
            onStickerChange={setSticker}
          />
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
        <div className="mb-2 grid grid-cols-2 gap-1.5 text-xs 2xl:grid-cols-3">
          {COLORS.map((color) => (
            <div key={color} className="flex items-center justify-between rounded bg-white px-2 py-0.5">
              <span className="capitalize text-slate-600">{color}</span>
              <strong className={counts[color] === 9 ? 'text-emerald-700' : 'text-rose-700'}>
                {counts[color]}
              </strong>
            </div>
          ))}
        </div>

        {validation.errors.length > 0 && (
          <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
            {validation.errors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onValidate}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <ShieldCheck className="h-4 w-4" />
          Validate
        </button>
      </div>
    </aside>
  );
}

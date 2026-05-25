import { Camera, Check, RefreshCw, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { COLORS, COLOR_HEX } from '../../lib/cubeState';
import type { CubeColor, FaceName, ScannedSticker, ScannerFaceLabel } from '../../types/cube';

const FACE_MAP: Record<ScannerFaceLabel, FaceName> = {
  U: 'up',
  D: 'down',
  F: 'front',
  B: 'back',
  L: 'left',
  R: 'right'
};

const SCANNER_COLORS: Record<string, CubeColor> = {
  WHITE: 'white',
  YELLOW: 'yellow',
  RED: 'red',
  ORANGE: 'orange',
  BLUE: 'blue',
  GREEN: 'green'
};

type ApiSticker = {
  row: number;
  col: number;
  color: string;
  confidence: number;
};

type Props = {
  onSaveFace: (face: FaceName, stickers: CubeColor[]) => void;
};

function fallbackScan(face: ScannerFaceLabel): ScannedSticker[] {
  const baseColorByFace: Record<ScannerFaceLabel, CubeColor> = {
    U: 'white',
    D: 'yellow',
    F: 'green',
    B: 'blue',
    L: 'orange',
    R: 'red'
  };
  return Array.from({ length: 9 }, (_, index) => ({
    row: Math.floor(index / 3),
    col: index % 3,
    color: baseColorByFace[face],
    confidence: index === 2 ? 0.64 : 0.91
  }));
}

export function ScannerPanel({ onSaveFace }: Props) {
  const [face, setFace] = useState<ScannerFaceLabel>('U');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stickers, setStickers] = useState<ScannedSticker[]>(fallbackScan('U'));
  const [message, setMessage] = useState('Ready');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lowConfidence = useMemo(
    () => stickers.filter((sticker) => sticker.confidence < 0.72).length,
    [stickers]
  );

  const scanFile = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    setIsScanning(true);
    setMessage('Scanning');

    const formData = new FormData();
    formData.append('face', face);
    formData.append('frame', file);

    try {
      const response = await fetch('/scan-face', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Scanner API unavailable');
      const payload = (await response.json()) as { stickers?: ApiSticker[]; message?: string };
      if (!payload.stickers || payload.stickers.length !== 9) throw new Error(payload.message ?? 'Weak detection');
      setStickers(
        payload.stickers.map((sticker) => ({
          row: sticker.row,
          col: sticker.col,
          color: SCANNER_COLORS[sticker.color] ?? 'white',
          confidence: sticker.confidence
        }))
      );
      setMessage(payload.message ?? 'Face detected');
    } catch {
      setStickers(fallbackScan(face));
      setMessage('Using local fallback scan. Correct low confidence stickers before saving.');
    } finally {
      setIsScanning(false);
    }
  };

  const updateSticker = (index: number, color: CubeColor) => {
    setStickers((current) =>
      current.map((sticker, stickerIndex) =>
        stickerIndex === index ? { ...sticker, color, confidence: 1 } : sticker
      )
    );
  };

  const saveFace = () => {
    const ordered = [...stickers].sort((a, b) => a.row - b.row || a.col - b.col);
    onSaveFace(
      FACE_MAP[face],
      ordered.map((sticker) => sticker.color)
    );
    setMessage(`Saved ${face} face`);
  };

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Camera Scanner</h2>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <button
          type="button"
          title="Upload frame"
          onClick={() => fileInputRef.current?.click()}
          className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-6 gap-1.5">
        {(['U', 'D', 'F', 'B', 'L', 'R'] as ScannerFaceLabel[]).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setFace(label);
              setStickers(fallbackScan(label));
            }}
            className={[
              'focus-ring rounded-md border px-2 py-1 text-sm font-semibold',
              face === label ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void scanFile(file);
        }}
      />

      <div className="grid gap-4 md:grid-cols-[minmax(180px,1fr)_220px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {previewUrl ? (
            <img src={previewUrl} alt="Scanner preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <Camera className="h-8 w-8" />
            </div>
          )}
          <div className="absolute inset-6 grid grid-cols-3 gap-2">
            {stickers.map((sticker, index) => (
              <div
                key={`${sticker.row}-${sticker.col}-${index}`}
                className="rounded-md border-2 border-white/90 bg-white/10 shadow"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 grid grid-cols-3 gap-1.5">
            {stickers.map((sticker, index) => (
              <button
                key={`${sticker.row}-${sticker.col}`}
                type="button"
                title={`Confidence ${Math.round(sticker.confidence * 100)}%`}
                onClick={() => {
                  const current = COLORS.indexOf(sticker.color);
                  updateSticker(index, COLORS[(current + 1) % COLORS.length]);
                }}
                className={[
                  'focus-ring aspect-square rounded-md border text-[11px] font-semibold',
                  sticker.confidence < 0.72 ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-300'
                ].join(' ')}
                style={{ backgroundColor: COLOR_HEX[sticker.color] }}
              >
                {Math.round(sticker.confidence * 100)}
              </button>
            ))}
          </div>

          <div className="mb-3 grid grid-cols-6 gap-1">
            {COLORS.map((color) => (
              <span
                key={color}
                title={color}
                className="aspect-square rounded border border-slate-300"
                style={{ backgroundColor: COLOR_HEX[color] }}
              />
            ))}
          </div>

          <div className="mb-3 text-sm text-slate-600">
            Low confidence: <strong className={lowConfidence ? 'text-rose-700' : 'text-emerald-700'}>{lowConfidence}</strong>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isScanning}
              onClick={() => setStickers(fallbackScan(face))}
              className="focus-ring flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Retake
            </button>
            <button
              type="button"
              onClick={saveFace}
              className="focus-ring flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Camera, CheckCircle2, Paintbrush, RefreshCw, Send, Settings2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CameraScanner } from '../components/Scanner/CameraScanner';
import { DetectedFaceGrid } from '../components/Scanner/DetectedFaceGrid';
import { FaceScanGuide } from '../components/Scanner/FaceScanGuide';
import { ImageUploadScanner } from '../components/Scanner/ImageUploadScanner';
import { ScanProgress } from '../components/Scanner/ScanProgress';
import { StickerCorrectionModal } from '../components/Scanner/StickerCorrectionModal';
import { createSolvedCube } from '../lib/cubeState';
import { validateCube } from '../lib/validators';
import type { CubeColor, CubeState, FaceName, ScannedSticker, ScannerFaceLabel } from '../types/cube';

type InputMode = 'camera' | 'upload' | 'manual';

const FACE_MAP: Record<ScannerFaceLabel, FaceName> = {
  U: 'up',
  D: 'down',
  F: 'front',
  B: 'back',
  L: 'left',
  R: 'right'
};

const COLOR_MAP: Record<string, CubeColor> = {
  WHITE: 'white',
  YELLOW: 'yellow',
  RED: 'red',
  ORANGE: 'orange',
  BLUE: 'blue',
  GREEN: 'green'
};

const DEFAULT_FACE_COLOR: Record<ScannerFaceLabel, CubeColor> = {
  U: 'white',
  D: 'yellow',
  F: 'green',
  B: 'blue',
  L: 'orange',
  R: 'red'
};

const SCAN_ORDER: ScannerFaceLabel[] = ['U', 'D', 'F', 'B', 'L', 'R'];

type Props = {
  cubeState: CubeState;
  onSaveFace: (face: FaceName, stickers: CubeColor[]) => void;
  onUseCube: (cube: CubeState) => void;
};

function fallbackStickers(face: ScannerFaceLabel): ScannedSticker[] {
  return Array.from({ length: 9 }, (_, index) => ({
    row: Math.floor(index / 3),
    col: index % 3,
    color: DEFAULT_FACE_COLOR[face],
    confidence: index === 4 ? 0.96 : index % 4 === 0 ? 0.68 : 0.88
  }));
}

export function ScannerPage({ cubeState, onSaveFace, onUseCube }: Props) {
  const [face, setFace] = useState<ScannerFaceLabel>('U');
  const [detected, setDetected] = useState<ScannedSticker[] | null>(null);
  const [savedFaces, setSavedFaces] = useState<Record<ScannerFaceLabel, CubeColor[]>>({} as Record<ScannerFaceLabel, CubeColor[]>);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const [message, setMessage] = useState('Choose live camera or upload an image.');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastSavedFace, setLastSavedFace] = useState<ScannerFaceLabel | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const lowConfidenceCount = useMemo(
    () => detected?.filter((sticker) => sticker.confidence < 0.72).length ?? 0,
    [detected]
  );

  const savedCount = (['U', 'D', 'F', 'B', 'L', 'R'] as ScannerFaceLabel[]).filter((label) => savedFaces[label]).length;
  const canSaveCurrentFace = detected?.length === 9;

  const scanFile = async (file: File, targetFace: ScannerFaceLabel) => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setIsScanning(true);
    setMessage('Scanning image...');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('face', targetFace);

    try {
      const response = await fetch('/scan-image', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Scanner backend unavailable');
      const payload = (await response.json()) as {
        success: boolean;
        stickers: Array<{ row: number; col: number; color: string; confidence: number }>;
        needsManualCorrection: boolean;
      };
      if (!payload.success || payload.stickers.length !== 9) throw new Error('Weak detection');
      setDetected(
        payload.stickers.map((sticker) => ({
          row: sticker.row,
          col: sticker.col,
          color: COLOR_MAP[sticker.color] ?? 'white',
          confidence: sticker.confidence
        }))
      );
      setMessage(payload.needsManualCorrection ? 'Low confidence stickers need correction.' : 'Face detected.');
    } catch {
      if (file.name.includes('demo-capture')) {
        setDetected(fallbackStickers(targetFace));
        setMessage('Demo face generated. Correct highlighted stickers before saving.');
      } else {
        setDetected(null);
        setMessage('No 3x3 face was detected. Retake the photo, upload a clearer image, or switch to Manual.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const retakeFace = () => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setDetected(null);
    setLastSavedFace(null);
    setMessage(`Retake ${face} face or upload a clearer image.`);
  };

  const updateSticker = (color: CubeColor) => {
    if (selectedSticker === null) return;
    setDetected((current) =>
      current?.map((sticker, index) =>
        index === selectedSticker ? { ...sticker, color, confidence: 1 } : sticker
      ) ?? current
    );
  };

  const saveCurrentFace = () => {
    if (!detected || detected.length !== 9) {
      setMessage('Capture, upload, or manually create a detected face before saving.');
      return;
    }
    const ordered = [...detected].sort((a, b) => a.row - b.row || a.col - b.col);
    const colors = ordered.map((sticker) => sticker.color);
    setSavedFaces((current) => ({ ...current, [face]: colors }));
    onSaveFace(FACE_MAP[face], colors);
    setLastSavedFace(face);
    const nextFace = SCAN_ORDER.find((label) => label !== face && !savedFaces[label]);
    if (nextFace) {
      setFace(nextFace);
      setDetected(inputMode === 'manual' ? fallbackStickers(nextFace) : null);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setMessage(`Saved ${face} face. Next: scan ${nextFace}.`);
    } else {
      setMessage(`Saved ${face} face. All faces are ready to send to the solver.`);
    }
  };

  const buildScannedCube = (): CubeState => {
    const next = createSolvedCube();
    (Object.keys(savedFaces) as ScannerFaceLabel[]).forEach((label) => {
      next[FACE_MAP[label]] = savedFaces[label].map((color) => ({ color }));
    });
    return next;
  };

  const scannedCube = buildScannedCube();
  const validation = validateCube(scannedCube);
  const allFacesSaved = SCAN_ORDER.every((label) => savedFaces[label]);

  return (
    <main className="mx-auto min-h-[calc(100vh-89px)] max-w-[1800px] p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Cube Input Scanner</h2>
          <p className="text-sm text-slate-600">Live camera, upload scanning, confidence review, and manual correction.</p>
        </div>
        <button
          type="button"
          onClick={() => setDebugMode((value) => !value)}
          className="focus-ring flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <Settings2 className="h-4 w-4" />
          Debug {debugMode ? 'On' : 'Off'}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(480px,1fr)_360px]">
        <div className="space-y-4">
          <section className="panel rounded-lg p-4">
            <h2 className="mb-3 text-lg font-semibold text-slate-950">Input Mode</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['camera', 'Live', Camera],
                ['upload', 'Upload', Upload],
                ['manual', 'Manual', Paintbrush]
              ].map(([mode, label, Icon]) => (
                <button
                  key={mode as string}
                  type="button"
                  onClick={() => {
                    setInputMode(mode as InputMode);
                    if (mode === 'manual' && !detected) {
                      setDetected(fallbackStickers(face));
                    }
                    setMessage(
                      mode === 'camera'
                        ? 'Start camera and capture a face.'
                        : mode === 'upload'
                          ? 'Upload one cube face image.'
                          : 'Click stickers to correct this face manually.'
                    );
                  }}
                  className={[
                    'focus-ring flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold',
                    inputMode === mode ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700'
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {label as string}
                </button>
              ))}
            </div>
          </section>
          <FaceScanGuide face={face} onFaceChange={(nextFace) => {
            setFace(nextFace);
            setDetected(inputMode === 'manual' ? fallbackStickers(nextFace) : null);
            setLastSavedFace(null);
            setMessage(`Ready to scan ${nextFace} face.`);
          }} />
          <ScanProgress savedFaces={Object.keys(savedFaces) as ScannerFaceLabel[]} />
          {inputMode === 'upload' && <ImageUploadScanner face={face} onScanFile={scanFile} />}
          <section className="panel rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold text-slate-950">Last Captured Image</h2>
            {previewUrl ? (
              <img src={previewUrl} alt="Last scanned cube face" className="aspect-video w-full rounded-lg border border-slate-200 object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
                No image captured yet
              </div>
            )}
          </section>
        </div>

        <div className="space-y-4">
          {inputMode === 'camera' ? (
            <CameraScanner face={face} onCapture={scanFile} />
          ) : (
            <section className="panel rounded-lg p-4">
              <h2 className="mb-2 text-lg font-semibold text-slate-950">
                {inputMode === 'upload' ? 'Upload Scanner Active' : 'Manual Correction Active'}
              </h2>
              <p className="text-sm text-slate-600">
                {inputMode === 'upload'
                  ? 'Use the upload control on the left, then review confidence scores on the right.'
                  : 'Click a sticker in the detected face grid and choose the correct color.'}
              </p>
            </section>
          )}
          {debugMode && (
            <section className="panel rounded-lg p-4 text-sm text-slate-700">
              <h2 className="mb-2 text-lg font-semibold text-slate-950">Debug View</h2>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="rounded bg-slate-50 p-3">Original frame</div>
                <div className="rounded bg-slate-50 p-3">Detected contours</div>
                <div className="rounded bg-slate-50 p-3">Sticker crops</div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <DetectedFaceGrid stickers={detected} onStickerClick={setSelectedSticker} />
          <section className="panel rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold text-slate-950">Review & Save</h2>
            <p className="mb-3 text-sm text-slate-600">{message}</p>
            {lastSavedFace && (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm font-medium text-emerald-800">
                Face {lastSavedFace} saved to CubeState.
              </div>
            )}
            <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm">
              {detected ? (
                <>
                  Low confidence stickers: <strong className={lowConfidenceCount ? 'text-rose-700' : 'text-emerald-700'}>{lowConfidenceCount}</strong>
                </>
              ) : (
                <span className="text-slate-600">No detected face yet. Capture or upload an image first.</span>
              )}
            </div>
            <button
              type="button"
              onClick={retakeFace}
              className="focus-ring mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Retake / Reset Face
            </button>
            <button
              type="button"
              disabled={isScanning || !canSaveCurrentFace}
              onClick={saveCurrentFace}
              className="focus-ring mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              Save {face} Face
            </button>
            <button
              type="button"
              disabled={!allFacesSaved}
              onClick={() => onUseCube(scannedCube)}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" />
              {allFacesSaved ? 'Send CubeState to Solver' : `Scan all faces first (${savedCount}/6)`}
            </button>
          </section>

          <section className="panel rounded-lg p-4">
            <h2 className="mb-2 text-lg font-semibold text-slate-950">Validation</h2>
            {!allFacesSaved ? (
              <p className="text-sm text-slate-600">Save all 6 faces to validate the complete cube.</p>
            ) : validation.valid ? (
              <p className="text-sm text-emerald-700">Current scanned faces have valid color counts.</p>
            ) : (
              <div className="space-y-1 text-sm text-rose-700">
                {validation.errors.slice(0, 6).map((error) => (
                  <div key={error}>{error}</div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <StickerCorrectionModal
        open={selectedSticker !== null}
        onClose={() => setSelectedSticker(null)}
        onSelect={updateSticker}
      />
    </main>
  );
}

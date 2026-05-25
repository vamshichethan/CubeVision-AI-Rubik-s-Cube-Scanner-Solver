import { Camera, CameraOff, ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ScannerFaceLabel } from '../../types/cube';

type Props = {
  face: ScannerFaceLabel;
  onCapture: (file: File, face: ScannerFaceLabel) => void;
};

export function CameraScanner({ face, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setIsVideoReady(false);
      setError(null);
    } catch {
      setError('Camera permission failed. Use image upload or manual input.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
    setIsVideoReady(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setError('Camera is still warming up. Wait for the preview, then capture again.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], `${face}-capture.jpg`, { type: 'image/jpeg' }), face);
    }, 'image/jpeg', 0.92);
  };

  const captureDemoFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 540;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#e2e8f0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const colors = ['#f8fafc', '#facc15', '#ef4444', '#f97316', '#2563eb', '#16a34a'];
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        context.fillStyle = colors[(row * 3 + col) % colors.length];
        context.fillRect(210 + col * 105, 120 + row * 105, 82, 82);
      }
    }
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], `${face}-demo-capture.jpg`, { type: 'image/jpeg' }), face);
    }, 'image/jpeg', 0.92);
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Live Camera</h2>
          <p className="text-sm text-slate-600">Capture one face at a time.</p>
        </div>
        <button
          type="button"
          onClick={cameraOn ? stopCamera : startCamera}
          className="focus-ring flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {cameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {cameraOn ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => setIsVideoReady(true)}
          className="h-full w-full object-cover"
        />
        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            Camera preview
          </div>
        )}
        <div className="absolute inset-8 grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="rounded-md border-2 border-white/90 bg-white/10 shadow" />
          ))}
        </div>
      </div>

      {error && <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">{error}</div>}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!cameraOn || !isVideoReady}
          onClick={captureFrame}
          className="focus-ring flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          <ScanLine className="h-4 w-4" />
          Capture Frame
        </button>
        <button
          type="button"
          onClick={captureDemoFrame}
          className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Demo Capture
        </button>
      </div>
    </section>
  );
}

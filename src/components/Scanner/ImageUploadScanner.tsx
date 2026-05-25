import { Upload } from 'lucide-react';
import type { ScannerFaceLabel } from '../../types/cube';

type Props = {
  face: ScannerFaceLabel;
  onScanFile: (file: File, face: ScannerFaceLabel) => void;
};

export function ImageUploadScanner({ face, onScanFile }: Props) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <Upload className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-slate-950">Upload Image</h2>
      </div>
      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onScanFile(file, face);
        }}
      />
    </section>
  );
}

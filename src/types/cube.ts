export type CubeColor = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green';

export type FaceName = 'up' | 'down' | 'front' | 'back' | 'left' | 'right';
export type ScannerFaceLabel = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type Sticker = {
  color: CubeColor;
};

export type Face = Sticker[];

export type CubeState = Record<FaceName, Face>;

export type MoveFace = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';

export type Move = {
  face: MoveFace;
  prime?: boolean;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  counts: Record<CubeColor, number>;
};

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type StickerPose = {
  face: FaceName;
  row: number;
  col: number;
  position: Vec3;
  normal: Vec3;
  color: CubeColor;
};

export type AnimationMove = {
  move: Move;
  direction: 'forward' | 'backward';
};

export type ScannedSticker = {
  row: number;
  col: number;
  color: CubeColor;
  confidence: number;
};

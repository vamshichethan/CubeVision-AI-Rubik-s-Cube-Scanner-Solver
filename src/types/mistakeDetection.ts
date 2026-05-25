import type { CubeState, Move } from './cube';

export type VerificationStatus = 'idle' | 'verified' | 'mismatch' | 'low-confidence';

export type MistakeDetectionResult = {
  status: VerificationStatus;
  expectedMove: string;
  detectedMove: string | null;
  confidence: number;
  mismatchedStickers: number;
  matchPercentage: number;
  suggestedAction: string;
  recoveryOptions: string[];
  message: string;
  expectedState: CubeState;
  actualState: CubeState;
};

export type StepTracker = {
  previousState: CubeState;
  expectedState: CubeState;
  expectedMove: Move;
  remainingMoves: Move[];
};

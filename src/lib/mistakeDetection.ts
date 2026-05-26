import { FACE_ORDER } from './cubeState';
import { applyMove, moveToString, parseMove } from './moves';
import type { CubeState, Move } from '../types/cube';
import type { MistakeDetectionResult } from '../types/mistakeDetection';

const CANDIDATE_MOVES = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];

export function compareStates(expected: CubeState, actual: CubeState) {
  let matches = 0;
  let total = 0;

  for (const face of FACE_ORDER) {
    expected[face].forEach((sticker, index) => {
      total += 1;
      if (actual[face][index]?.color === sticker.color) matches += 1;
    });
  }

  const matchPercentage = total ? matches / total : 0;
  return {
    match: matches === total,
    matches,
    total,
    mismatches: total - matches,
    matchPercentage
  };
}

export function inferMove(previousState: CubeState, actualState: CubeState) {
  let bestMove: string | null = null;
  let bestScore = -1;

  for (const token of CANDIDATE_MOVES) {
    const move = parseMove(token);
    if (!move) continue;
    const candidateState = applyMove(previousState, move);
    const score = compareStates(candidateState, actualState).matchPercentage;
    if (score > bestScore) {
      bestMove = token;
      bestScore = score;
    }
  }

  return { detectedMove: bestMove, confidence: bestScore };
}

export function verifyMoveStep(
  previousState: CubeState,
  expectedState: CubeState,
  actualState: CubeState,
  expectedMove: Move,
  scanConfidence = 0.93
): MistakeDetectionResult {
  const comparison = compareStates(expectedState, actualState);
  const expectedMoveText = moveToString(expectedMove);

  if (scanConfidence < 0.7) {
    return {
      status: 'low-confidence',
      expectedMove: expectedMoveText,
      detectedMove: null,
      confidence: scanConfidence,
      mismatchedStickers: comparison.mismatches,
      matchPercentage: comparison.matchPercentage,
      suggestedAction: 'Retake scan',
      recoveryOptions: ['Retake scan', 'Manual correction'],
      message: 'Scan confidence is low. Retake before changing the solution.',
      expectedState,
      actualState
    };
  }

  if (comparison.match) {
    return {
      status: 'verified',
      expectedMove: expectedMoveText,
      detectedMove: expectedMoveText,
      confidence: Math.min(1, scanConfidence),
      mismatchedStickers: 0,
      matchPercentage: 1,
      suggestedAction: 'Continue',
      recoveryOptions: [],
      message: 'Move verified. Continue to the next step.',
      expectedState,
      actualState
    };
  }

  const inferred = inferMove(previousState, actualState);
  const confident = inferred.confidence >= 0.82;
  return {
    status: 'mismatch',
    expectedMove: expectedMoveText,
    detectedMove: confident ? inferred.detectedMove : null,
    confidence: Math.min(inferred.confidence, scanConfidence),
    mismatchedStickers: comparison.mismatches,
    matchPercentage: comparison.matchPercentage,
    suggestedAction: confident ? 'Undo move' : 'Recalculate solution',
    recoveryOptions: confident
      ? ['Undo move', 'Recalculate solution', 'Retake scan']
      : ['Retake scan', 'Manual correction', 'Recalculate solution'],
    message: confident
      ? `Detected move mismatch: expected ${expectedMoveText}, likely performed ${inferred.detectedMove}.`
      : 'Mismatch is too large for confident move inference.',
    expectedState,
    actualState
  };
}

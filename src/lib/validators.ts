import { COLORS, FACE_ORDER, getStickerPoses, locationFromPose } from './cubeState';
import type { CubeColor, CubeState, FaceName, ValidationResult, Vec3 } from '../types/cube';

function positionKey(position: Vec3): string {
  return `${position.x},${position.y},${position.z}`;
}

function colorKey(colors: CubeColor[]): string {
  return [...colors].sort().join('-');
}

function piecePositionType(position: Vec3): 'edge' | 'corner' | 'center' {
  const visibleAxes = [position.x, position.y, position.z].filter((value) => Math.abs(value) === 1).length;
  if (visibleAxes === 3) return 'corner';
  if (visibleAxes === 2) return 'edge';
  return 'center';
}

function faceFromNormal(position: Vec3, normal: Vec3): FaceName {
  return locationFromPose(position, normal).face;
}

function buildExpectedPieceKeys(cube: CubeState, type: 'edge' | 'corner'): Map<string, number> {
  const centerColorByFace = FACE_ORDER.reduce(
    (map, face) => {
      map[face] = cube[face][4].color;
      return map;
    },
    {} as Record<FaceName, CubeColor>
  );
  const groups = new Map<string, CubeColor[]>();

  getStickerPoses(cube).forEach((pose) => {
    if (piecePositionType(pose.position) !== type) return;
    const key = positionKey(pose.position);
    const face = faceFromNormal(pose.position, pose.normal);
    groups.set(key, [...(groups.get(key) ?? []), centerColorByFace[face]]);
  });

  const expected = new Map<string, number>();
  groups.forEach((colors) => {
    const key = colorKey(colors);
    expected.set(key, (expected.get(key) ?? 0) + 1);
  });
  return expected;
}

function buildCurrentPieceKeys(cube: CubeState, type: 'edge' | 'corner'): Map<string, number> {
  const groups = new Map<string, CubeColor[]>();
  getStickerPoses(cube).forEach((pose) => {
    if (piecePositionType(pose.position) !== type) return;
    const key = positionKey(pose.position);
    groups.set(key, [...(groups.get(key) ?? []), pose.color]);
  });

  const current = new Map<string, number>();
  groups.forEach((colors) => {
    const key = colorKey(colors);
    current.set(key, (current.get(key) ?? 0) + 1);
  });
  return current;
}

function validatePieces(cube: CubeState, type: 'edge' | 'corner'): string[] {
  const expected = buildExpectedPieceKeys(cube, type);
  const current = buildCurrentPieceKeys(cube, type);
  const label = type === 'edge' ? 'edge' : 'corner';
  const errors: string[] = [];

  current.forEach((count, key) => {
    const expectedCount = expected.get(key) ?? 0;
    if (expectedCount === 0) {
      errors.push(`Invalid ${label} color combination: ${key}.`);
    } else if (count > expectedCount) {
      errors.push(`Duplicate ${label} piece: ${key}.`);
    }
  });

  expected.forEach((expectedCount, key) => {
    const count = current.get(key) ?? 0;
    if (count < expectedCount) {
      errors.push(`Missing ${label} piece: ${key}.`);
    }
  });

  return errors;
}

export function validateCube(cube: CubeState): ValidationResult {
  const counts = COLORS.reduce(
    (map, color) => {
      map[color] = 0;
      return map;
    },
    {} as Record<CubeColor, number>
  );

  Object.values(cube).forEach((face) => {
    face.forEach((sticker) => {
      counts[sticker.color] += 1;
    });
  });

  const errors = COLORS.flatMap((color) =>
    counts[color] === 9 ? [] : [`${color} appears ${counts[color]} times; expected 9.`]
  );

  const centers = FACE_ORDER.map((face) => cube[face][4].color);
  if (new Set(centers).size !== 6) {
    errors.push('Center colors must be unique.');
  }

  if (errors.length === 0) {
    errors.push(...validatePieces(cube, 'edge'));
    errors.push(...validatePieces(cube, 'corner'));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings:
      errors.length === 0
        ? ['Physical piece check passed. Full twist/parity validation belongs in the C++ deep validator.']
        : [],
    counts
  };
}

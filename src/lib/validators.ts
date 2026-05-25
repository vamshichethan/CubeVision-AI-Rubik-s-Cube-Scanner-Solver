import { COLORS, FACE_ORDER } from './cubeState';
import type { CubeColor, CubeState, ValidationResult } from '../types/cube';

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

  return {
    valid: errors.length === 0,
    errors,
    counts
  };
}

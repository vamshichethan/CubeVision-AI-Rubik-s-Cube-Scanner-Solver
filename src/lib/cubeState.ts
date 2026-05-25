import type { CubeColor, CubeState, FaceName, StickerPose, Vec3 } from '../types/cube';

export const COLORS: CubeColor[] = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];

export const FACE_ORDER: FaceName[] = ['up', 'down', 'front', 'back', 'left', 'right'];

export const FACE_LABELS: Record<FaceName, string> = {
  up: 'Up',
  down: 'Down',
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right'
};

export const COLOR_HEX: Record<CubeColor, string> = {
  white: '#f8fafc',
  yellow: '#facc15',
  red: '#ef4444',
  orange: '#f97316',
  blue: '#2563eb',
  green: '#16a34a'
};

export const SOLVED_FACE_COLOR: Record<FaceName, CubeColor> = {
  up: 'white',
  down: 'yellow',
  front: 'green',
  back: 'blue',
  left: 'orange',
  right: 'red'
};

export function createSolvedCube(): CubeState {
  return FACE_ORDER.reduce((cube, face) => {
    cube[face] = Array.from({ length: 9 }, () => ({ color: SOLVED_FACE_COLOR[face] }));
    return cube;
  }, {} as CubeState);
}

export function cloneCube(cube: CubeState): CubeState {
  return FACE_ORDER.reduce((copy, face) => {
    copy[face] = cube[face].map((sticker) => ({ ...sticker }));
    return copy;
  }, {} as CubeState);
}

export function isSolvedCube(cube: CubeState): boolean {
  return FACE_ORDER.every((face) => {
    const center = cube[face][4].color;
    return cube[face].every((sticker) => sticker.color === center);
  });
}

function sameVec(a: Vec3, b: Vec3): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function poseFromLocation(face: FaceName, row: number, col: number): Omit<StickerPose, 'color'> {
  switch (face) {
    case 'up':
      return { face, row, col, position: { x: col - 1, y: 1, z: row - 1 }, normal: { x: 0, y: 1, z: 0 } };
    case 'down':
      return { face, row, col, position: { x: col - 1, y: -1, z: 1 - row }, normal: { x: 0, y: -1, z: 0 } };
    case 'front':
      return { face, row, col, position: { x: col - 1, y: 1 - row, z: 1 }, normal: { x: 0, y: 0, z: 1 } };
    case 'back':
      return { face, row, col, position: { x: 1 - col, y: 1 - row, z: -1 }, normal: { x: 0, y: 0, z: -1 } };
    case 'left':
      return { face, row, col, position: { x: -1, y: 1 - row, z: col - 1 }, normal: { x: -1, y: 0, z: 0 } };
    case 'right':
      return { face, row, col, position: { x: 1, y: 1 - row, z: 1 - col }, normal: { x: 1, y: 0, z: 0 } };
  }
}

export function locationFromPose(position: Vec3, normal: Vec3): { face: FaceName; row: number; col: number } {
  if (sameVec(normal, { x: 0, y: 1, z: 0 })) return { face: 'up', row: position.z + 1, col: position.x + 1 };
  if (sameVec(normal, { x: 0, y: -1, z: 0 })) return { face: 'down', row: 1 - position.z, col: position.x + 1 };
  if (sameVec(normal, { x: 0, y: 0, z: 1 })) return { face: 'front', row: 1 - position.y, col: position.x + 1 };
  if (sameVec(normal, { x: 0, y: 0, z: -1 })) return { face: 'back', row: 1 - position.y, col: 1 - position.x };
  if (sameVec(normal, { x: -1, y: 0, z: 0 })) return { face: 'left', row: 1 - position.y, col: position.z + 1 };
  return { face: 'right', row: 1 - position.y, col: 1 - position.z };
}

export function getStickerPoses(cube: CubeState): StickerPose[] {
  return FACE_ORDER.flatMap((face) =>
    cube[face].map((sticker, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return { ...poseFromLocation(face, row, col), color: sticker.color };
    })
  );
}

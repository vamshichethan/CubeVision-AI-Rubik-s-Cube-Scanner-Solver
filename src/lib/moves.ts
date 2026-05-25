import { cloneCube, FACE_ORDER, getStickerPoses, locationFromPose } from './cubeState';
import type { CubeState, Move, MoveFace, Vec3 } from '../types/cube';

export const MOVE_SEQUENCE: Move[] = parseMoves("R U R' U' F R U R' U' F'");

export function moveToString(move: Move): string {
  return `${move.face}${move.prime ? "'" : ''}`;
}

export function parseMove(token: string): Move | null {
  const face = token[0] as MoveFace;
  if (!['R', 'L', 'U', 'D', 'F', 'B'].includes(face)) return null;
  if (token.length === 1) return { face };
  if (token.length === 2 && token[1] === "'") return { face, prime: true };
  return null;
}

export function parseMoves(sequence: string): Move[] {
  return sequence
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseMove)
    .filter((move): move is Move => Boolean(move));
}

export function inverseMove(move: Move): Move {
  return { face: move.face, prime: !move.prime };
}

export function inverseMoves(moves: Move[]): Move[] {
  return [...moves].reverse().map(inverseMove);
}

function clockwiseSign(face: MoveFace): number {
  return ['R', 'U', 'F'].includes(face) ? -1 : 1;
}

function rotateQuarter(value: Vec3, face: MoveFace, prime = false): Vec3 {
  let sign = clockwiseSign(face);
  if (prime) sign *= -1;

  if (face === 'R' || face === 'L') {
    return { x: value.x, y: -sign * value.z, z: sign * value.y };
  }
  if (face === 'U' || face === 'D') {
    return { x: sign * value.z, y: value.y, z: -sign * value.x };
  }
  return { x: -sign * value.y, y: sign * value.x, z: value.z };
}

export function isInMoveLayer(position: Vec3, face: MoveFace): boolean {
  switch (face) {
    case 'R':
      return position.x === 1;
    case 'L':
      return position.x === -1;
    case 'U':
      return position.y === 1;
    case 'D':
      return position.y === -1;
    case 'F':
      return position.z === 1;
    case 'B':
      return position.z === -1;
  }
}

export function applyMove(cube: CubeState, move: Move): CubeState {
  const next = cloneCube(cube);
  const stickers = getStickerPoses(cube);

  for (const pose of stickers) {
    let position = pose.position;
    let normal = pose.normal;

    if (isInMoveLayer(position, move.face)) {
      position = rotateQuarter(position, move.face, move.prime);
      normal = rotateQuarter(normal, move.face, move.prime);
    }

    const target = locationFromPose(position, normal);
    next[target.face][target.row * 3 + target.col] = { color: pose.color };
  }

  return next;
}

export function applyMoves(cube: CubeState, moves: Move[]): CubeState {
  return moves.reduce((state, move) => applyMove(state, move), cube);
}

export function cubeToCompactString(cube: CubeState): string {
  return FACE_ORDER.map((face) => cube[face].map((sticker) => sticker.color[0]).join('')).join('');
}

import { RoundedBox } from '@react-three/drei';
import type { CubeColor, Vec3 } from '../../types/cube';
import { COLOR_HEX } from '../../lib/cubeState';

type CubieSticker = {
  normal: Vec3;
  color: CubeColor;
};

type Props = {
  position: Vec3;
  stickers: CubieSticker[];
};

function planeRotation(normal: Vec3): [number, number, number] {
  if (normal.z === 1) return [0, 0, 0];
  if (normal.z === -1) return [0, Math.PI, 0];
  if (normal.x === 1) return [0, Math.PI / 2, 0];
  if (normal.x === -1) return [0, -Math.PI / 2, 0];
  if (normal.y === 1) return [-Math.PI / 2, 0, 0];
  return [Math.PI / 2, 0, 0];
}

function planePosition(normal: Vec3): [number, number, number] {
  return [normal.x * 0.515, normal.y * 0.515, normal.z * 0.515];
}

export function Cubie({ position, stickers }: Props) {
  return (
    <group position={[position.x * 1.04, position.y * 1.04, position.z * 1.04]}>
      <RoundedBox args={[0.98, 0.98, 0.98]} radius={0.045} smoothness={3}>
        <meshStandardMaterial color="#161b22" roughness={0.54} metalness={0.08} />
      </RoundedBox>
      {stickers.map((sticker) => (
        <mesh
          key={`${sticker.normal.x}-${sticker.normal.y}-${sticker.normal.z}`}
          position={planePosition(sticker.normal)}
          rotation={planeRotation(sticker.normal)}
        >
          <planeGeometry args={[0.74, 0.74]} />
          <meshStandardMaterial color={COLOR_HEX[sticker.color]} roughness={0.38} />
        </mesh>
      ))}
    </group>
  );
}

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getStickerPoses } from '../../lib/cubeState';
import { animationAngle, MOVE_ANIMATION_MS } from '../../lib/moveAnimator';
import { isInMoveLayer } from '../../lib/moves';
import type { AnimationMove, CubeState, Vec3 } from '../../types/cube';
import { Cubie } from './Cubie';

type Props = {
  cubeState: CubeState;
  animation: AnimationMove | null;
  onAnimationComplete: () => void;
};

type CubieData = {
  position: Vec3;
  stickers: { normal: Vec3; color: CubeState[keyof CubeState][number]['color'] }[];
};

function axisForMove(face: AnimationMove['move']['face']): 'x' | 'y' | 'z' {
  if (face === 'R' || face === 'L') return 'x';
  if (face === 'U' || face === 'D') return 'y';
  return 'z';
}

export function RubiksCube({ cubeState, animation, onAnimationComplete }: Props) {
  const rotatingGroup = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);
  const completed = useRef(false);

  const cubies = useMemo<CubieData[]>(() => {
    const map = new Map<string, CubieData>();
    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          map.set(`${x},${y},${z}`, { position: { x, y, z }, stickers: [] });
        }
      }
    }

    for (const pose of getStickerPoses(cubeState)) {
      const key = `${pose.position.x},${pose.position.y},${pose.position.z}`;
      map.get(key)?.stickers.push({ normal: pose.normal, color: pose.color });
    }

    return [...map.values()];
  }, [cubeState]);

  useFrame((state) => {
    if (!animation || !rotatingGroup.current) {
      startedAt.current = null;
      completed.current = false;
      return;
    }

    if (startedAt.current === null) {
      startedAt.current = state.clock.elapsedTime * 1000;
      completed.current = false;
    }

    const elapsed = state.clock.elapsedTime * 1000 - startedAt.current;
    const progress = Math.min(elapsed / MOVE_ANIMATION_MS, 1);
    const move = animation.direction === 'forward' ? animation.move : { ...animation.move, prime: !animation.move.prime };
    const angle = animationAngle(move, progress);
    const axis = axisForMove(move.face);

    rotatingGroup.current.rotation.set(0, 0, 0);
    rotatingGroup.current.rotation[axis] = angle;

    // State is committed only after the visual quarter-turn completes.
    // Until then, the affected layer lives inside this rotating group.
    if (progress >= 1 && !completed.current) {
      completed.current = true;
      onAnimationComplete();
    }
  });

  const rotatingCubies = animation
    ? cubies.filter((cubie) => isInMoveLayer(cubie.position, animation.move.face))
    : [];
  const staticCubies = animation
    ? cubies.filter((cubie) => !isInMoveLayer(cubie.position, animation.move.face))
    : cubies;

  return (
    <group rotation={[-0.42, 0.64, 0]}>
      {staticCubies.map((cubie) => (
        <Cubie key={`${cubie.position.x}-${cubie.position.y}-${cubie.position.z}`} {...cubie} />
      ))}
      <group ref={rotatingGroup}>
        {rotatingCubies.map((cubie) => (
          <Cubie key={`${cubie.position.x}-${cubie.position.y}-${cubie.position.z}`} {...cubie} />
        ))}
      </group>
    </group>
  );
}

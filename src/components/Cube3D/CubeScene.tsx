import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { AnimationMove, CubeState } from '../../types/cube';
import { RubiksCube } from './RubiksCube';

type Props = {
  cubeState: CubeState;
  animation: AnimationMove | null;
  onAnimationComplete: () => void;
};

export function CubeScene({ cubeState, animation, onAnimationComplete }: Props) {
  return (
    <section className="panel relative min-h-[min(58vh,520px)] overflow-hidden rounded-lg">
      <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={['#e8eef7']} />
        <PerspectiveCamera makeDefault position={[5, 4.4, 6]} fov={42} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[5, 8, 6]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={0.55} />
        <RubiksCube cubeState={cubeState} animation={animation} onAnimationComplete={onAnimationComplete} />
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={4.2} maxDistance={9} />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-700 shadow-sm">
        3D Visualizer
      </div>
    </section>
  );
}

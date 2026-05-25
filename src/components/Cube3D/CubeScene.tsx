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
    <section className="panel relative h-[clamp(520px,calc(100vh-260px),760px)] overflow-hidden rounded-lg bg-[#e8eef7]">
      <Canvas className="h-full w-full" dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={['#e8eef7']} />
        <PerspectiveCamera makeDefault position={[4.6, 3.8, 5.8]} fov={38} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 6]} intensity={2.35} />
        <directionalLight position={[-4, -2, -3]} intensity={0.65} />
        <RubiksCube cubeState={cubeState} animation={animation} onAnimationComplete={onAnimationComplete} />
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={4.2} maxDistance={8.5} />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
        Interactive 3D cube
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md border border-slate-200 bg-white/85 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
        Drag to orbit
      </div>
    </section>
  );
}

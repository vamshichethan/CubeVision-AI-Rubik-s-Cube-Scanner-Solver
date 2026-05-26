import { useCallback, useEffect, useMemo, useState } from 'react';
import { CubeScene } from './components/Cube3D/CubeScene';
import { ManualInputPanel } from './components/CubeInput/ManualInputPanel';
import { SolutionControls } from './components/Controls/SolutionControls';
import { Navbar } from './components/Layout/Navbar';
import type { AppPage } from './components/Layout/Navbar';
import { cloneCube, createSolvedCube } from './lib/cubeState';
import { solveCube } from './lib/mockSolver';
import { applyMove, applyMoves, inverseMove, inverseMoves, parseMove } from './lib/moves';
import { validateCube } from './lib/validators';
import { BenchmarkDashboard } from './pages/BenchmarkDashboard';
import { HomePage } from './pages/HomePage';
import { RecoveryPage } from './pages/RecoveryPage';
import { ScannerPage } from './pages/ScannerPage';
import type { AnimationMove, CubeColor, CubeState, Move, MoveFace } from './types/cube';

const SCRAMBLE_FACES: MoveFace[] = ['R', 'L', 'U', 'D', 'F', 'B'];

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [cubeState, setCubeState] = useState<CubeState>(() => createSolvedCube());
  const [selectedColor, setSelectedColor] = useState<CubeColor>('white');
  const [validation, setValidation] = useState(() => validateCube(createSolvedCube()));
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSolving, setIsSolving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animation, setAnimation] = useState<AnimationMove | null>(null);
  const [playbackStartState, setPlaybackStartState] = useState<CubeState>(() => createSolvedCube());
  const [solverMessage, setSolverMessage] = useState('Ready for a verified solution.');
  const [scrambleMoves, setScrambleMoves] = useState<Move[]>([]);
  const [legalHistoryMoves, setLegalHistoryMoves] = useState<Move[]>([]);

  const isAnimating = Boolean(animation);
  const liveValidation = useMemo(() => validateCube(cubeState), [cubeState]);

  const handleCubeChange = (nextCube: CubeState) => {
    setCubeState(nextCube);
    setValidation(validateCube(nextCube));
    setMoves([]);
    setScrambleMoves([]);
    setLegalHistoryMoves([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setSolverMessage('Cube changed. Run validation before solving.');
    setPlaybackStartState(cloneCube(nextCube));
  };

  const handleScannedFaceSave = (face: keyof CubeState, colors: CubeColor[]) => {
    handleCubeChange({
      ...cubeState,
      [face]: colors.map((color) => ({ color }))
    });
  };

  const handleBenchmarkSolution = (moveTokens: string[]) => {
    const parsed = moveTokens.map(parseMove).filter((move): move is Move => Boolean(move));
    setMoves(parsed);
    setCurrentIndex(0);
    setIsPlaying(false);
    setAnimation(null);
    setPlaybackStartState(cloneCube(cubeState));
    setCurrentPage('workspace');
  };

  const handleValidate = () => {
    const result = validateCube(cubeState);
    setValidation(result);
    setSolverMessage(
      result.valid
        ? 'Validation passed: color counts and physical pieces are valid.'
        : `Validation failed with ${result.errors.length} issue${result.errors.length === 1 ? '' : 's'}.`
    );
  };

  const handleSolve = async () => {
    const result = validateCube(cubeState);
    setValidation(result);
    if (!result.valid || isAnimating) return;

    setIsSolving(true);
    setIsPlaying(false);
    setPlaybackStartState(cloneCube(cubeState));
    try {
      if (legalHistoryMoves.length > 0) {
        const solution = inverseMoves(legalHistoryMoves);
        setMoves(solution);
        setCurrentIndex(0);
        setSolverMessage(`Loaded ${solution.length} verified inverse history moves.`);
        return;
      }
      const result = await solveCube(cubeState);
      const solution = result.moves;
      setMoves(solution);
      setCurrentIndex(0);
      setSolverMessage(
        result.success && solution.length > 0
          ? `Loaded ${solution.length} solver moves.`
          : result.message
      );
    } finally {
      setIsSolving(false);
    }
  };

  const startNextMove = useCallback(() => {
    if (isAnimating || currentIndex >= moves.length) return;
    setAnimation({ move: moves[currentIndex], direction: 'forward' });
  }, [currentIndex, isAnimating, moves]);

  const startPreviousMove = () => {
    if (isAnimating || currentIndex <= 0) return;
    setAnimation({ move: moves[currentIndex - 1], direction: 'backward' });
  };

  const handleAnimationComplete = useCallback(() => {
    setCubeState((state) => {
      if (!animation) return state;
      const moveToApply = animation.direction === 'forward' ? animation.move : inverseMove(animation.move);
      return applyMove(state, moveToApply);
    });
    setCurrentIndex((index) => {
      if (!animation) return index;
      return animation.direction === 'forward' ? index + 1 : Math.max(0, index - 1);
    });
    setAnimation(null);
  }, [animation]);

  const handleResetPlayback = () => {
    setIsPlaying(false);
    setAnimation(null);
    setCubeState(cloneCube(playbackStartState));
    setCurrentIndex(0);
  };

  const generateScramble = (length: number): Move[] => {
    const generated: Move[] = [];
    while (generated.length < length) {
      const face = SCRAMBLE_FACES[Math.floor(Math.random() * SCRAMBLE_FACES.length)];
      const previous = generated[generated.length - 1];
      if (previous?.face === face) continue;
      generated.push({ face, prime: Math.random() > 0.5 });
    }
    return generated;
  };

  const handleGenerateScramble = (length: number) => {
    if (isAnimating) return;
    const scramble = generateScramble(length);
    const solved = createSolvedCube();
    const scrambled = applyMoves(solved, scramble);
    const solution = inverseMoves(scramble);
    setCubeState(scrambled);
    setValidation(validateCube(scrambled));
    setScrambleMoves(scramble);
    setLegalHistoryMoves(scramble);
    setMoves(solution);
    setCurrentIndex(0);
    setIsPlaying(false);
    setAnimation(null);
    setPlaybackStartState(cloneCube(scrambled));
    setSolverMessage(`Generated ${length}-move scramble. Inverse solution is loaded.`);
  };

  const handleResetSolved = () => {
    if (isAnimating) return;
    const solved = createSolvedCube();
    setCubeState(solved);
    setValidation(validateCube(solved));
    setScrambleMoves([]);
    setLegalHistoryMoves([]);
    setMoves([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setAnimation(null);
    setPlaybackStartState(cloneCube(solved));
    setSolverMessage('Reset to solved cube.');
  };

  const handleLoadInverseSolution = () => {
    if (!scrambleMoves.length || isAnimating) return;
    const solution = inverseMoves(scrambleMoves);
    setMoves(solution);
    setCurrentIndex(0);
    setIsPlaying(false);
    setPlaybackStartState(cloneCube(cubeState));
    setSolverMessage(`Loaded ${solution.length} inverse scramble moves.`);
  };

  const handleApplyManualMove = (move: Move) => {
    if (isAnimating) return;
    const nextCube = applyMove(cubeState, move);
    setCubeState(nextCube);
    setValidation(validateCube(nextCube));
    setScrambleMoves([]);
    setLegalHistoryMoves((history) => [...history, move]);
    setMoves([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setPlaybackStartState(cloneCube(nextCube));
    setSolverMessage(`Applied manual move ${move.face}${move.prime ? "'" : ''}.`);
  };

  useEffect(() => {
    if (!isPlaying || isAnimating) return;
    if (currentIndex >= moves.length) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => startNextMove(), 180);
    return () => window.clearTimeout(timer);
  }, [currentIndex, isAnimating, isPlaying, moves.length, startNextMove]);

  return (
    <div className="min-h-screen bg-[#eef2f7]">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'home' ? (
        <HomePage
          validationValid={liveValidation.valid}
          moveCount={moves.length}
          solverMessage={solverMessage}
          onNavigate={setCurrentPage}
        />
      ) : currentPage === 'workspace' ? (
        <main className="mx-auto grid min-h-[calc(100vh-89px)] max-w-[1900px] grid-cols-1 gap-4 p-4 xl:grid-cols-[300px_minmax(520px,1fr)_300px]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <ManualInputPanel
              cubeState={cubeState}
              selectedColor={selectedColor}
              validation={validation}
              onSelectedColorChange={setSelectedColor}
              onCubeChange={handleCubeChange}
              onValidate={handleValidate}
            />
          </div>

          <div className="flex min-h-[560px] flex-col gap-4">
            <div className="xl:sticky xl:top-24 xl:z-10">
              <CubeScene
                cubeState={cubeState}
                animation={animation}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
            <div className="panel rounded-lg p-4">
              <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                <div>
                  <strong className="block text-slate-950">Validation</strong>
                  {liveValidation.valid ? 'Color counts are valid.' : 'Adjust counts before solving.'}
                </div>
                <div>
                  <strong className="block text-slate-950">Animation Lock</strong>
                  {isAnimating ? 'Move in progress.' : 'Ready for input.'}
                </div>
                <div>
                  <strong className="block text-slate-950">Solver</strong>
                  {solverMessage}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:sticky xl:top-24 xl:self-start">
            <SolutionControls
              moves={moves}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              isAnimating={isAnimating}
              isSolving={isSolving}
              canSolve={liveValidation.valid}
              onSolve={handleSolve}
              onNext={startNextMove}
              onPrevious={startPreviousMove}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onReset={handleResetPlayback}
              scrambleMoves={scrambleMoves}
              onGenerateScramble={handleGenerateScramble}
              onResetSolved={handleResetSolved}
              onLoadInverseSolution={handleLoadInverseSolution}
              onApplyManualMove={handleApplyManualMove}
            />
          </div>
        </main>
      ) : currentPage === 'scanner' ? (
        <ScannerPage
          cubeState={cubeState}
          onSaveFace={handleScannedFaceSave}
          onUseCube={(nextCube) => {
            handleCubeChange(nextCube);
            setCurrentPage('workspace');
          }}
        />
      ) : currentPage === 'recovery' ? (
        <RecoveryPage
          cubeState={cubeState}
          onUseRecalculatedSolution={(nextMoves) => {
            setMoves(nextMoves);
            setCurrentIndex(0);
            setIsPlaying(false);
            setAnimation(null);
            setSolverMessage(`Loaded ${nextMoves.length} recalculated recovery moves.`);
            setPlaybackStartState(cloneCube(cubeState));
            setCurrentPage('workspace');
          }}
        />
      ) : (
        <BenchmarkDashboard onSendSolution={handleBenchmarkSolution} />
      )}
    </div>
  );
}

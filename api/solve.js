import Cube from 'cubejs';

const FACE_ORDER = ['up', 'right', 'front', 'down', 'left', 'back'];
const FACE_LETTER = {
  up: 'U',
  right: 'R',
  front: 'F',
  down: 'D',
  left: 'L',
  back: 'B'
};

let solverReady = false;

function initSolver() {
  if (!solverReady) {
    Cube.initSolver();
    solverReady = true;
  }
}

function cubeToKociembaFacelets(cubeState) {
  const colorToFace = {};

  for (const face of Object.keys(FACE_LETTER)) {
    const center = cubeState?.[face]?.[4]?.color;
    if (!center) throw new Error(`Missing center sticker for ${face}`);
    colorToFace[center] = FACE_LETTER[face];
  }

  return FACE_ORDER.map((face) => {
    const stickers = cubeState?.[face];
    if (!Array.isArray(stickers) || stickers.length !== 9) {
      throw new Error(`Face ${face} must contain exactly 9 stickers`);
    }
    return stickers.map((sticker) => colorToFace[sticker.color] ?? '?').join('');
  }).join('');
}

function solveCube(cubeState) {
  initSolver();
  const startedAt = performance.now();
  const facelets = cubeToKociembaFacelets(cubeState);
  const cube = Cube.fromString(facelets);

  if (cube.isSolved()) {
    return {
      success: true,
      solution: [],
      facelets,
      timeTakenMs: performance.now() - startedAt,
      message: 'Cube is already solved.'
    };
  }

  const solutionText = cube.solve();
  return {
    success: true,
    solution: solutionText.trim() ? solutionText.trim().split(/\s+/) : [],
    facelets,
    timeTakenMs: performance.now() - startedAt,
    message: 'Solved with cubejs Kociemba two-phase backend.'
  };
}

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    response.status(200).json(solveCube(request.body?.cubeState));
  } catch (error) {
    response.status(422).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to solve cube'
    });
  }
}

import http from 'node:http';
import Cube from 'cubejs';

const PORT = Number(process.env.CUBEVISION_SOLVER_PORT ?? 8787);
const HOST = process.env.CUBEVISION_SOLVER_HOST ?? '127.0.0.1';
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

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        request.destroy();
        reject(new Error('Request body is too large'));
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(payload));
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
  const solution = solutionText.trim() ? solutionText.trim().split(/\s+/) : [];
  return {
    success: true,
    solution,
    facelets,
    timeTakenMs: performance.now() - startedAt,
    message: solution.length ? 'Solved with cubejs Kociemba two-phase backend.' : 'Cube is already solved.'
  };
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    writeJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    writeJson(response, 200, { ok: true, solver: 'cubejs-kociemba' });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/solve') {
    try {
      const payload = await readJson(request);
      writeJson(response, 200, solveCube(payload.cubeState));
    } catch (error) {
      writeJson(response, 422, {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to solve cube'
      });
    }
    return;
  }

  writeJson(response, 404, { success: false, message: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`CubeVision Kociemba solver backend listening on http://${HOST}:${PORT}`);
});

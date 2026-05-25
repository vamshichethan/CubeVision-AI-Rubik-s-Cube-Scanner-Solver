export const FACES = ["U", "R", "F", "D", "L", "B"];

export const COLORS = {
  U: { name: "White", value: "#f5f5f5" },
  R: { name: "Red", value: "#e93d3d" },
  F: { name: "Green", value: "#20b15a" },
  D: { name: "Yellow", value: "#ffd53d" },
  L: { name: "Orange", value: "#ff8a2a" },
  B: { name: "Blue", value: "#2477ff" }
};

const FACE_BY_NORMAL = {
  "0,1,0": "U",
  "1,0,0": "R",
  "0,0,1": "F",
  "0,-1,0": "D",
  "-1,0,0": "L",
  "0,0,-1": "B"
};

export class Cube {
  constructor(state = Cube.solvedState()) {
    this.state = cloneState(state);
  }

  static solvedState() {
    return FACES.reduce((state, face) => {
      state[face] = Array(9).fill(face);
      return state;
    }, {});
  }

  clone() {
    return new Cube(this.state);
  }

  reset() {
    this.state = Cube.solvedState();
  }

  setSticker(face, index, colorKey) {
    if (!FACES.includes(face)) {
      throw new Error(`Unknown face: ${face}`);
    }
    if (index < 0 || index > 8) {
      throw new Error(`Sticker index out of range: ${index}`);
    }
    if (!FACES.includes(colorKey)) {
      throw new Error(`Unknown color: ${colorKey}`);
    }
    this.state[face][index] = colorKey;
  }

  applyAlgorithm(sequence) {
    const moves = parseMoves(sequence);
    moves.forEach((move) => this.applyMove(move));
    return moves;
  }

  applyMove(move) {
    const parsed = parseMove(move);
    const turns = parsed.amount === 2 ? 2 : parsed.prime ? 3 : 1;
    for (let index = 0; index < turns; index += 1) {
      this.rotateQuarter(parsed.face);
    }
  }

  rotateQuarter(face) {
    const facelets = stateToFacelets(this.state);
    const axis = axisForFace(face);
    const layerValue = layerForFace(face);
    const next = new Map();

    for (const [key, color] of facelets.entries()) {
      const facelet = JSON.parse(key);
      if (facelet.position[axis.index] !== layerValue) {
        next.set(key, color);
        continue;
      }

      const rotated = {
        position: rotateVector(facelet.position, axis.index, axis.direction),
        normal: rotateVector(facelet.normal, axis.index, axis.direction)
      };
      next.set(JSON.stringify(rotated), color);
    }

    this.state = faceletsToState(next);
  }
}

export function parseMoves(sequence) {
  if (!sequence.trim()) {
    return [];
  }

  return sequence
    .trim()
    .split(/\s+/)
    .map((token) => parseMove(token).token);
}

export function parseMove(token) {
  const match = /^([URFDLB])(['2]?)$/.exec(token.trim());
  if (!match) {
    throw new Error(`Invalid move: ${token}`);
  }

  return {
    token: match[0],
    face: match[1],
    prime: match[2] === "'",
    amount: match[2] === "2" ? 2 : 1
  };
}

export function validateCube(state) {
  const counts = getColorCounts(state);
  const flat = FACES.flatMap((face) => state[face] || []);
  const centerColors = FACES.map((face) => state[face]?.[4]);
  const uniqueCenters = new Set(centerColors);

  const checks = [
    {
      label: "54 stickers present",
      passed: flat.length === 54 && flat.every(Boolean),
      detail: `${flat.length}/54 stickers`
    },
    {
      label: "Six unique centers",
      passed: uniqueCenters.size === 6 && centerColors.every((color) => FACES.includes(color)),
      detail: `${uniqueCenters.size}/6 centers`
    },
    {
      label: "Nine stickers per color",
      passed: FACES.every((face) => counts[face] === 9),
      detail: FACES.map((face) => `${COLORS[face].name}: ${counts[face]}`).join(", ")
    }
  ];

  return {
    valid: checks.every((check) => check.passed),
    checks,
    counts
  };
}

export function getColorCounts(state) {
  const counts = FACES.reduce((result, face) => {
    result[face] = 0;
    return result;
  }, {});

  FACES.forEach((face) => {
    (state[face] || []).forEach((color) => {
      if (Object.hasOwn(counts, color)) {
        counts[color] += 1;
      }
    });
  });

  return counts;
}

export function cloneState(state) {
  return FACES.reduce((next, face) => {
    next[face] = [...state[face]];
    return next;
  }, {});
}

function stateToFacelets(state) {
  const facelets = new Map();
  FACES.forEach((face) => {
    state[face].forEach((color, index) => {
      facelets.set(JSON.stringify(faceletFromIndex(face, index)), color);
    });
  });
  return facelets;
}

function faceletsToState(facelets) {
  const state = FACES.reduce((next, face) => {
    next[face] = Array(9).fill(null);
    return next;
  }, {});

  for (const [key, color] of facelets.entries()) {
    const facelet = JSON.parse(key);
    const { face, index } = indexFromFacelet(facelet);
    state[face][index] = color;
  }

  return state;
}

function faceletFromIndex(face, index) {
  const row = Math.floor(index / 3);
  const col = index % 3;

  if (face === "U") {
    return { position: [col - 1, 1, row - 1], normal: [0, 1, 0] };
  }
  if (face === "D") {
    return { position: [col - 1, -1, 1 - row], normal: [0, -1, 0] };
  }
  if (face === "F") {
    return { position: [col - 1, 1 - row, 1], normal: [0, 0, 1] };
  }
  if (face === "B") {
    return { position: [1 - col, 1 - row, -1], normal: [0, 0, -1] };
  }
  if (face === "R") {
    return { position: [1, 1 - row, 1 - col], normal: [1, 0, 0] };
  }
  return { position: [-1, 1 - row, col - 1], normal: [-1, 0, 0] };
}

function indexFromFacelet(facelet) {
  const normalKey = facelet.normal.join(",");
  const face = FACE_BY_NORMAL[normalKey];
  const [x, y, z] = facelet.position;

  if (face === "U") {
    return { face, index: (z + 1) * 3 + (x + 1) };
  }
  if (face === "D") {
    return { face, index: (1 - z) * 3 + (x + 1) };
  }
  if (face === "F") {
    return { face, index: (1 - y) * 3 + (x + 1) };
  }
  if (face === "B") {
    return { face, index: (1 - y) * 3 + (1 - x) };
  }
  if (face === "R") {
    return { face, index: (1 - y) * 3 + (1 - z) };
  }
  return { face, index: (1 - y) * 3 + (z + 1) };
}

function axisForFace(face) {
  const axisMap = {
    U: { index: 1, direction: 1 },
    D: { index: 1, direction: -1 },
    R: { index: 0, direction: 1 },
    L: { index: 0, direction: -1 },
    F: { index: 2, direction: 1 },
    B: { index: 2, direction: -1 }
  };
  return axisMap[face];
}

function layerForFace(face) {
  return {
    U: 1,
    D: -1,
    R: 1,
    L: -1,
    F: 1,
    B: -1
  }[face];
}

function rotateVector(vector, axisIndex, direction) {
  const [x, y, z] = vector;

  if (axisIndex === 0) {
    return direction === 1 ? [x, -z, y] : [x, z, -y];
  }
  if (axisIndex === 1) {
    return direction === 1 ? [z, y, -x] : [-z, y, x];
  }
  return direction === 1 ? [-y, x, z] : [y, -x, z];
}

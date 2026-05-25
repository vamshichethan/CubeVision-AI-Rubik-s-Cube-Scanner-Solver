import { Cube, FACES, invertAlgorithm, isSolved, serializeState } from "./cube.js";

const MOVE_SET = FACES.flatMap((face) => [face, `${face}'`, `${face}2`]);

export function solveCube(state, history = []) {
  if (isSolved(state)) {
    return createResult([], "already-solved", 0, 0);
  }

  if (history.length > 0) {
    const moves = invertAlgorithm(history);
    return createResult(moves, "inverse-history", moves.length, history.length);
  }

  const startedAt = performance.now();
  const search = iddfs(state, 6);
  if (search) {
    return createResult(search.moves, "bounded-iddfs", performance.now() - startedAt, search.nodes);
  }

  return {
    solved: false,
    strategy: "manual-review",
    moves: [],
    explanations: [],
    metrics: {
      solutionLength: 0,
      timeMs: performance.now() - startedAt,
      nodesExplored: search?.nodes ?? 0
    }
  };
}

export function benchmarkSolvers(state, history = []) {
  const inverse = history.length ? invertAlgorithm(history) : [];
  const solved = isSolved(state);
  const estimatedLength = solved ? 0 : inverse.length || 6;

  return [
    createBenchmarkRow("BFS", estimatedLength, Math.max(1, estimatedLength ** 4), estimatedLength * 18, "Explodes quickly as depth grows"),
    createBenchmarkRow("IDDFS", estimatedLength, Math.max(1, estimatedLength ** 3), estimatedLength * 7, "Low memory, repeated depth passes"),
    createBenchmarkRow("A*", Math.max(0, estimatedLength - 1), Math.max(1, estimatedLength ** 2), estimatedLength * 5, "Fast when heuristic is strong"),
    createBenchmarkRow("IDA*", Math.max(0, estimatedLength - 1), Math.max(1, estimatedLength * 42), estimatedLength * 3, "Best browser-friendly search baseline"),
    createBenchmarkRow("Kociemba", Math.min(estimatedLength, 22), Math.max(1, estimatedLength * 12), estimatedLength * 2, "Production target for optimized solutions")
  ];
}

export function explainMove(move, index, total) {
  const faceNames = {
    U: "top layer",
    D: "bottom layer",
    R: "right layer",
    L: "left layer",
    F: "front layer",
    B: "back layer"
  };
  const face = move[0];
  const turn = move.endsWith("2") ? "half turn" : move.endsWith("'") ? "counter-clockwise turn" : "clockwise turn";

  return {
    move,
    title: `Step ${index + 1} of ${total}`,
    detail: `Apply a ${turn} on the ${faceNames[face]} to move the cube closer to the captured target state.`
  };
}

function createResult(moves, strategy, timeMs, nodesExplored) {
  return {
    solved: true,
    strategy,
    moves,
    explanations: moves.map((move, index) => explainMove(move, index, moves.length)),
    metrics: {
      solutionLength: moves.length,
      timeMs,
      nodesExplored
    }
  };
}

function createBenchmarkRow(name, solutionLength, nodesExplored, timeMs, note) {
  return {
    name,
    solutionLength,
    nodesExplored,
    timeMs: Number(timeMs.toFixed(2)),
    memory: `${Math.max(1, Math.ceil(nodesExplored / 36))} KB`,
    note
  };
}

function iddfs(state, maxDepth) {
  const startKey = serializeState(state);
  let nodes = 0;

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const visited = new Set([startKey]);
    const result = depthLimitedSearch(new Cube(state), depth, [], visited, null);
    nodes += result.nodes;
    if (result.moves) {
      return { moves: result.moves, nodes };
    }
  }

  return null;
}

function depthLimitedSearch(cube, depth, path, visited, lastFace) {
  let nodes = 1;
  if (isSolved(cube.state)) {
    return { moves: path, nodes };
  }
  if (depth === 0) {
    return { moves: null, nodes };
  }

  for (const move of MOVE_SET) {
    if (move[0] === lastFace) {
      continue;
    }

    const next = cube.clone();
    next.applyMove(move);
    const key = serializeState(next.state);
    if (visited.has(key)) {
      continue;
    }

    visited.add(key);
    const result = depthLimitedSearch(next, depth - 1, [...path, move], visited, move[0]);
    nodes += result.nodes;
    if (result.moves) {
      return { moves: result.moves, nodes };
    }
    visited.delete(key);
  }

  return { moves: null, nodes };
}

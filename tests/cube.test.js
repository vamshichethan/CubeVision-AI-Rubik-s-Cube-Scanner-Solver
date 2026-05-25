import assert from "node:assert/strict";
import { Cube, FACES, invertAlgorithm, parseMoves, validateCube } from "../src/cube.js";
import { buildFaceFromRgbSamples, classifyRgb, DEFAULT_RGB_SAMPLES } from "../src/scanner.js";
import { solveCube } from "../src/solver.js";

const solved = new Cube();
assert.equal(validateCube(solved.state).valid, true, "solved cube should pass basic validation");

FACES.forEach((face) => {
  const cube = new Cube();
  cube.applyAlgorithm(`${face} ${face}'`);
  assert.deepEqual(cube.state, Cube.solvedState(), `${face} followed by ${face}' should solve`);
});

FACES.forEach((face) => {
  const cube = new Cube();
  cube.applyAlgorithm(`${face} ${face} ${face} ${face}`);
  assert.deepEqual(cube.state, Cube.solvedState(), `${face} four times should solve`);
});

const parsed = parseMoves("R U R' U' F2");
assert.deepEqual(parsed, ["R", "U", "R'", "U'", "F2"], "move parser should preserve valid tokens");

const invalid = new Cube();
invalid.setSticker("U", 0, "R");
assert.equal(validateCube(invalid.state).valid, false, "wrong color count should fail validation");

const scramble = parseMoves("R U R' U'");
const scrambled = new Cube();
scrambled.applyAlgorithm(scramble.join(" "));
const solution = solveCube(scrambled.state, scramble);
assert.deepEqual(solution.moves, invertAlgorithm(scramble), "solver should invert tracked move history");
scrambled.applyAlgorithm(solution.moves.join(" "));
assert.deepEqual(scrambled.state, Cube.solvedState(), "tracked solution should solve the cube");

assert.equal(classifyRgb(DEFAULT_RGB_SAMPLES.B).face, "B", "scanner should classify calibrated blue");
assert.deepEqual(
  buildFaceFromRgbSamples(Array(9).fill(DEFAULT_RGB_SAMPLES.F)),
  Array(9).fill("F"),
  "scanner should build a 3x3 face from RGB samples"
);

console.log("Cube model tests passed");

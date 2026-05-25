import assert from "node:assert/strict";
import { Cube, FACES, parseMoves, validateCube } from "../src/cube.js";

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

console.log("Cube model tests passed");

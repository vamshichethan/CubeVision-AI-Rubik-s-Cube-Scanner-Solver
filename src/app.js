import { COLORS, Cube, FACES, cloneState, getStateAfterMoves, validateCube } from "./cube.js";
import { SAMPLE_SCANS } from "./scanner.js";
import { benchmarkSolvers, solveCube } from "./solver.js";

const cube = new Cube();
let selectedColor = null;
let moveHistory = [];
let solution = null;
let solutionIndex = 0;
let playbackTimer = null;
let solutionStartState = cloneState(cube.state);

const palette = document.querySelector("#palette");
const cubeNet = document.querySelector("#cubeNet");
const validationSummary = document.querySelector("#validationSummary");
const validationList = document.querySelector("#validationList");
const colorCounts = document.querySelector("#colorCounts");
const moveInput = document.querySelector("#moveInput");
const scanGrid = document.querySelector("#scanGrid");
const scannerHint = document.querySelector("#scannerHint");
const stepCard = document.querySelector("#stepCard");
const benchmarkTable = document.querySelector("#benchmarkTable");

renderPalette();
renderScanner();
renderCube();
renderValidation();
renderSolution();
renderBenchmarks();

document.querySelector("#validateBtn").addEventListener("click", renderValidation);
document.querySelector("#resetBtn").addEventListener("click", () => {
  stopPlayback();
  cube.reset();
  moveHistory = [];
  solution = null;
  solutionIndex = 0;
  solutionStartState = cloneState(cube.state);
  renderCube();
  renderValidation();
  renderSolution();
  renderBenchmarks();
});
document.querySelector("#scrambleBtn").addEventListener("click", () => {
  applyMoves("R U R' U' F R U R' U' F'", true);
});
document.querySelector("#applyMovesBtn").addEventListener("click", () => {
  applyMoves(moveInput.value, true);
});
document.querySelector("#solveBtn").addEventListener("click", () => {
  stopPlayback();
  solutionStartState = cloneState(cube.state);
  solution = solveCube(cube.state, moveHistory);
  solutionIndex = 0;
  renderSolution();
  renderBenchmarks();
});
document.querySelector("#prevStepBtn").addEventListener("click", () => {
  stopPlayback();
  stepSolution(-1);
});
document.querySelector("#nextStepBtn").addEventListener("click", () => {
  stopPlayback();
  stepSolution(1);
});
document.querySelector("#playBtn").addEventListener("click", () => {
  if (playbackTimer) {
    stopPlayback();
    return;
  }
  playbackTimer = window.setInterval(() => {
    if (!stepSolution(1)) {
      stopPlayback();
    }
  }, 700);
});

function renderScanner() {
  scanGrid.innerHTML = "";

  FACES.forEach((face) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scan-button";
    button.innerHTML = `<strong>${face}</strong><span>${COLORS[face].name}</span>`;
    button.addEventListener("click", () => {
      SAMPLE_SCANS[face].forEach((color, index) => cube.setSticker(face, index, color));
      scannerHint.textContent = `${COLORS[face].name} face captured from calibrated scanner sample.`;
      moveHistory = [];
      solution = null;
      solutionIndex = 0;
      solutionStartState = cloneState(cube.state);
      renderCube();
      renderValidation();
      renderSolution();
      renderBenchmarks();
    });
    scanGrid.append(button);
  });
}

function renderPalette() {
  palette.innerHTML = "";

  FACES.forEach((colorKey) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `color-swatch${selectedColor === colorKey ? " is-selected" : ""}`;
    button.style.backgroundColor = COLORS[colorKey].value;
    button.title = COLORS[colorKey].name;
    button.setAttribute("aria-label", COLORS[colorKey].name);
    button.addEventListener("click", () => {
      selectedColor = colorKey;
      renderPalette();
    });
    palette.append(button);
  });
}

function renderCube() {
  cubeNet.innerHTML = "";

  ["U", "L", "F", "R", "B", "D"].forEach((face) => {
    const faceElement = document.createElement("section");
    faceElement.className = "face";
    faceElement.dataset.face = face;
    faceElement.setAttribute("aria-label", `${face} face`);

    const title = document.createElement("div");
    title.className = "face-title";
    title.textContent = face;
    faceElement.append(title);

    cube.state[face].forEach((colorKey, index) => {
      const sticker = document.createElement("button");
      sticker.type = "button";
      sticker.className = "sticker";
      sticker.style.backgroundColor = COLORS[colorKey].value;
      sticker.title = `${face}${index + 1}: ${COLORS[colorKey].name}`;
      sticker.setAttribute("aria-label", sticker.title);
      sticker.addEventListener("click", () => {
        cube.setSticker(face, index, selectedColor ?? nextColor(colorKey));
        moveHistory = [];
        solution = null;
        solutionIndex = 0;
        solutionStartState = cloneState(cube.state);
        renderCube();
        renderValidation();
        renderSolution();
        renderBenchmarks();
      });
      faceElement.append(sticker);
    });

    cubeNet.append(faceElement);
  });
}

function renderValidation() {
  const result = validateCube(cube.state);
  validationSummary.textContent = result.valid ? "Valid basic state" : "Needs review";
  validationSummary.classList.toggle("is-valid", result.valid);
  validationSummary.classList.toggle("is-invalid", !result.valid);

  validationList.innerHTML = "";
  result.checks.forEach((check) => {
    const item = document.createElement("div");
    item.className = `validation-item ${check.passed ? "is-pass" : "is-fail"}`;
    item.innerHTML = `<strong>${check.passed ? "Pass" : "Fix"}: ${check.label}</strong><span>${check.detail}</span>`;
    validationList.append(item);
  });

  colorCounts.innerHTML = "";
  FACES.forEach((face) => {
    const item = document.createElement("div");
    item.className = "count-item";
    item.innerHTML = `<strong>${COLORS[face].name}</strong><span>${result.counts[face]} / 9</span>`;
    colorCounts.append(item);
  });
}

function renderSolution() {
  const playButton = document.querySelector("#playBtn");
  playButton.textContent = playbackTimer ? "Pause" : "Play";

  if (!solution) {
    stepCard.textContent = "Generate a solution to step through moves.";
    return;
  }

  if (!solution.solved) {
    stepCard.innerHTML = "<strong>Manual review needed</strong><span>Use scanner correction or a shorter scramble before solving.</span>";
    return;
  }

  if (solution.moves.length === 0) {
    stepCard.innerHTML = "<strong>Cube is solved</strong><span>No moves needed.</span>";
    return;
  }

  const activeIndex = Math.min(solutionIndex, solution.explanations.length - 1);
  const step = solution.explanations[activeIndex];
  stepCard.innerHTML = `
    <strong>${step.title}: ${step.move}</strong>
    <span>${step.detail}</span>
    <span>${solution.moves.length - activeIndex - 1} moves remaining • ${solution.strategy}</span>
  `;
}

function renderBenchmarks() {
  const rows = benchmarkSolvers(cube.state, moveHistory);
  benchmarkTable.innerHTML = rows
    .map(
      (row) => `
        <div class="benchmark-row">
          <strong>${row.name}</strong>
          <span>${row.solutionLength} moves</span>
          <span>${row.timeMs} ms</span>
          <span>${row.memory}</span>
        </div>
      `
    )
    .join("");
}

function nextColor(colorKey) {
  const currentIndex = FACES.indexOf(colorKey);
  return FACES[(currentIndex + 1) % FACES.length];
}

function applyMoves(sequence, trackHistory = false) {
  try {
    const moves = cube.applyAlgorithm(sequence);
    if (trackHistory) {
      moveHistory.push(...moves);
    }
    solution = null;
    solutionIndex = 0;
    solutionStartState = cloneState(cube.state);
    renderCube();
    renderValidation();
    renderSolution();
    renderBenchmarks();
  } catch (error) {
    validationSummary.textContent = error.message;
    validationSummary.classList.add("is-invalid");
    validationSummary.classList.remove("is-valid");
  }
}

function stepSolution(direction) {
  if (!solution?.moves.length) {
    return false;
  }

  const nextIndex = solutionIndex + direction;
  if (nextIndex < 0 || nextIndex > solution.moves.length) {
    return false;
  }

  const appliedMoves = solution.moves.slice(0, nextIndex);
  cube.state = getStateAfterMoves(solutionStartState, appliedMoves);
  solutionIndex = nextIndex;
  renderCube();
  renderValidation();
  renderSolution();
  return nextIndex < solution.moves.length;
}

function stopPlayback() {
  if (!playbackTimer) {
    return;
  }
  window.clearInterval(playbackTimer);
  playbackTimer = null;
  renderSolution();
}

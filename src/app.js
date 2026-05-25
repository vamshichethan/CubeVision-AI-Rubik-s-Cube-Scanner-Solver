import { COLORS, Cube, FACES, validateCube } from "./cube.js";

const cube = new Cube();
let selectedColor = "U";

const palette = document.querySelector("#palette");
const cubeNet = document.querySelector("#cubeNet");
const validationSummary = document.querySelector("#validationSummary");
const validationList = document.querySelector("#validationList");
const colorCounts = document.querySelector("#colorCounts");
const moveInput = document.querySelector("#moveInput");

renderPalette();
renderCube();
renderValidation();

document.querySelector("#validateBtn").addEventListener("click", renderValidation);
document.querySelector("#resetBtn").addEventListener("click", () => {
  cube.reset();
  renderCube();
  renderValidation();
});
document.querySelector("#scrambleBtn").addEventListener("click", () => {
  applyMoves("R U R' U' F R U R' U' F'");
});
document.querySelector("#applyMovesBtn").addEventListener("click", () => {
  applyMoves(moveInput.value);
});

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
        cube.setSticker(face, index, selectedColor);
        renderCube();
        renderValidation();
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

function applyMoves(sequence) {
  try {
    cube.applyAlgorithm(sequence);
    renderCube();
    renderValidation();
  } catch (error) {
    validationSummary.textContent = error.message;
    validationSummary.classList.add("is-invalid");
    validationSummary.classList.remove("is-valid");
  }
}

import { COLORS, FACES } from "./cube.js";

export const SAMPLE_SCANS = {
  U: ["U", "U", "U", "U", "U", "U", "U", "U", "U"],
  R: ["R", "R", "R", "R", "R", "R", "R", "R", "R"],
  F: ["F", "F", "F", "F", "F", "F", "F", "F", "F"],
  D: ["D", "D", "D", "D", "D", "D", "D", "D", "D"],
  L: ["L", "L", "L", "L", "L", "L", "L", "L", "L"],
  B: ["B", "B", "B", "B", "B", "B", "B", "B", "B"]
};

export const DEFAULT_RGB_SAMPLES = {
  U: [245, 245, 245],
  R: [233, 61, 61],
  F: [32, 177, 90],
  D: [255, 213, 61],
  L: [255, 138, 42],
  B: [36, 119, 255]
};

export function createDefaultCalibration() {
  return FACES.reduce((calibration, face) => {
    calibration[face] = rgbToHsv(DEFAULT_RGB_SAMPLES[face]);
    return calibration;
  }, {});
}

export function classifyRgb(rgb, calibration = createDefaultCalibration()) {
  const hsv = rgbToHsv(rgb);
  let bestFace = FACES[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  FACES.forEach((face) => {
    const distance = hsvDistance(hsv, calibration[face]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestFace = face;
    }
  });

  return {
    face: bestFace,
    name: COLORS[bestFace].name,
    confidence: Math.max(0, Math.min(1, 1 - bestDistance / 180)),
    hsv
  };
}

export function buildFaceFromRgbSamples(samples, calibration = createDefaultCalibration()) {
  if (samples.length !== 9) {
    throw new Error("A scan needs exactly 9 sticker samples.");
  }
  return samples.map((sample) => classifyRgb(sample, calibration).face);
}

export function rgbToHsv([red, green, blue]) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2);
    } else {
      hue = 60 * ((r - g) / delta + 4);
    }
  }

  return {
    h: hue < 0 ? hue + 360 : hue,
    s: max === 0 ? 0 : delta / max,
    v: max
  };
}

function hsvDistance(left, right) {
  const hueDistance = Math.min(Math.abs(left.h - right.h), 360 - Math.abs(left.h - right.h)) * 0.62;
  const saturationDistance = Math.abs(left.s - right.s) * 80;
  const valueDistance = Math.abs(left.v - right.v) * 60;
  return hueDistance + saturationDistance + valueDistance;
}

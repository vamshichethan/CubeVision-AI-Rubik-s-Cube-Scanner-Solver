from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

import numpy as np

from .calibration_manager import CalibrationManager
from .confidence_scorer import ConfidenceScorer


@dataclass(frozen=True)
class ColorPrediction:
    color: str
    confidence: float
    hsv: tuple[int, int, int]
    rgb_preview: tuple[int, int, int]


class ColorClassifier:
    """HSV-based sticker classifier with red hue wraparound handling."""

    def __init__(self, calibration: CalibrationManager | None = None) -> None:
        self.calibration = calibration or CalibrationManager()
        self.scorer = ConfidenceScorer()

    def classify(self, hsv: np.ndarray, rgb_preview: np.ndarray) -> ColorPrediction:
        h, s, v = (int(channel) for channel in hsv[:3])

        if s < 45 and v > 145:
            white_ref = self.calibration.reference_array("WHITE")
            score = self.scorer.score(hsv, white_ref, (45, 120, 90)).final_score
            return ColorPrediction("WHITE", score, (h, s, v), tuple(int(x) for x in rgb_preview[:3]))

        candidates: Dict[str, np.ndarray] = {
            color: self.calibration.reference_array(color)
            for color in ["YELLOW", "RED", "ORANGE", "BLUE", "GREEN"]
        }

        best_color = "WHITE"
        best_score = -1.0
        for color, reference in candidates.items():
            score = self.scorer.score(hsv, reference).final_score
            if color == "RED":
                # Red sits near both 0 and 180 degrees in OpenCV HSV.
                red_wrap_ref = np.array([179, reference[1], reference[2]], dtype=np.uint8)
                score = max(score, self.scorer.score(hsv, red_wrap_ref).final_score)
            if score > best_score:
                best_color = color
                best_score = score

        return ColorPrediction(best_color, best_score, (h, s, v), tuple(int(x) for x in rgb_preview[:3]))

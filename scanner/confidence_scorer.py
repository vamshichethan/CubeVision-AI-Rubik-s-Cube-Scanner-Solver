from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass(frozen=True)
class ConfidenceBreakdown:
    color_distance_score: float
    saturation_score: float
    value_score: float
    final_score: float


class ConfidenceScorer:
    """Converts HSV threshold distance into a normalized confidence score."""

    @staticmethod
    def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, value))

    def score(
        self,
        hsv: np.ndarray,
        reference_hsv: np.ndarray,
        channel_ranges: Iterable[float] = (90.0, 255.0, 255.0),
    ) -> ConfidenceBreakdown:
        hsv = hsv.astype(float)
        reference_hsv = reference_hsv.astype(float)
        ranges = np.array(list(channel_ranges), dtype=float)
        ranges[ranges == 0] = 1.0

        hue_delta = abs(hsv[0] - reference_hsv[0])
        hue_delta = min(hue_delta, 180.0 - hue_delta)
        delta = np.array([hue_delta, abs(hsv[1] - reference_hsv[1]), abs(hsv[2] - reference_hsv[2])])
        normalized_distance = float(np.linalg.norm(delta / ranges))
        color_distance_score = self.clamp(1.0 - normalized_distance)

        saturation_score = self.clamp(hsv[1] / 120.0)
        value_score = self.clamp(hsv[2] / 180.0)
        final = (color_distance_score * 0.7) + (saturation_score * 0.15) + (value_score * 0.15)

        return ConfidenceBreakdown(
            color_distance_score=color_distance_score,
            saturation_score=saturation_score,
            value_score=value_score,
            final_score=self.clamp(final),
        )

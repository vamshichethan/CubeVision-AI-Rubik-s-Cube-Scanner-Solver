from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ScanQuality:
    usable: bool
    confidence: float
    message: str


class ScanConsistencyChecker:
    """Guards against noisy or partial CV scans before move inference."""

    def check(self, sticker_confidences: list[float], minimum: float = 0.70) -> ScanQuality:
        if not sticker_confidences:
            return ScanQuality(False, 0.0, "No scan confidence values were provided.")

        average = sum(sticker_confidences) / len(sticker_confidences)
        low_count = sum(1 for value in sticker_confidences if value < minimum)
        usable = average >= minimum and low_count <= 4
        message = "Scan is usable." if usable else "Scan confidence is low; retake or correct manually."
        return ScanQuality(usable, round(average, 3), message)

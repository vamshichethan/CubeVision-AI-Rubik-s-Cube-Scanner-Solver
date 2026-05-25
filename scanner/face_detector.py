from __future__ import annotations

from dataclasses import dataclass
from typing import List

import cv2
import numpy as np


@dataclass(frozen=True)
class StickerContour:
    row: int
    col: int
    bbox: tuple[int, int, int, int]
    contour: np.ndarray
    area: float


@dataclass
class DetectionResult:
    ok: bool
    stickers: List[StickerContour]
    debug_image: np.ndarray
    mask: np.ndarray
    message: str


class FaceDetector:
    """Finds a 3x3 grid by filtering square-like contours."""

    def __init__(self, min_area: int = 450, max_area_ratio: float = 0.12) -> None:
        self.min_area = min_area
        self.max_area_ratio = max_area_ratio

    def detect(self, frame_bgr: np.ndarray) -> DetectionResult:
        image_area = frame_bgr.shape[0] * frame_bgr.shape[1]
        blurred = cv2.GaussianBlur(frame_bgr, (5, 5), 0)
        gray = cv2.cvtColor(blurred, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 40, 120)
        adaptive = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            31,
            7,
        )
        mask = cv2.bitwise_or(edges, adaptive)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8), iterations=2)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        candidates: list[tuple[int, int, int, int, np.ndarray, float]] = []

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < self.min_area or area > image_area * self.max_area_ratio:
                continue

            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.04 * perimeter, True)
            if len(approx) < 4 or not cv2.isContourConvex(approx):
                continue

            x, y, w, h = cv2.boundingRect(approx)
            aspect_ratio = w / float(h)
            if not 0.72 <= aspect_ratio <= 1.28:
                continue

            candidates.append((x, y, w, h, contour, area))

        selected = self._select_grid(candidates)
        debug = frame_bgr.copy()
        stickers: list[StickerContour] = []

        if len(selected) == 9:
            selected = self._sort_grid(selected)
            for index, (x, y, w, h, contour, area) in enumerate(selected):
                row, col = divmod(index, 3)
                stickers.append(StickerContour(row, col, (x, y, w, h), contour, area))
                cv2.rectangle(debug, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(debug, f"{row},{col}", (x, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1)
            return DetectionResult(True, stickers, debug, mask, "Detected 9 stickers.")

        for x, y, w, h, _, _ in candidates:
            cv2.rectangle(debug, (x, y), (x + w, y + h), (0, 180, 255), 2)

        return DetectionResult(False, [], debug, mask, f"Expected 9 stickers, found {len(selected)} confident candidates.")

    def _select_grid(self, candidates: list[tuple[int, int, int, int, np.ndarray, float]]) -> list[tuple[int, int, int, int, np.ndarray, float]]:
        if len(candidates) <= 9:
            return candidates

        candidates = sorted(candidates, key=lambda item: item[5], reverse=True)[:18]
        best: list[tuple[int, int, int, int, np.ndarray, float]] = []
        best_score = float("inf")

        for i in range(len(candidates)):
            subset = candidates[i : i + 9]
            if len(subset) < 9:
                break
            xs = np.array([x + w / 2 for x, _, w, _, _, _ in subset])
            ys = np.array([y + h / 2 for _, y, _, h, _, _ in subset])
            score = float(np.std(xs) + np.std(ys))
            if score < best_score:
                best = subset
                best_score = score
        return best or candidates[:9]

    @staticmethod
    def _sort_grid(items: list[tuple[int, int, int, int, np.ndarray, float]]) -> list[tuple[int, int, int, int, np.ndarray, float]]:
        rows = sorted(items, key=lambda item: item[1] + item[3] / 2)
        grouped = [rows[0:3], rows[3:6], rows[6:9]]
        sorted_rows = [sorted(row, key=lambda item: item[0] + item[2] / 2) for row in grouped]
        return [item for row in sorted_rows for item in row]

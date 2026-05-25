from __future__ import annotations

from dataclasses import dataclass
from typing import List

import cv2
import numpy as np

from .face_detector import StickerContour


@dataclass(frozen=True)
class StickerSample:
    row: int
    col: int
    bbox: tuple[int, int, int, int]
    hsv: np.ndarray
    rgb_preview: np.ndarray


class StickerExtractor:
    """Samples the center region of each detected sticker to avoid borders."""

    def __init__(self, center_crop_ratio: float = 0.42) -> None:
        self.center_crop_ratio = center_crop_ratio

    def extract(self, frame_bgr: np.ndarray, stickers: list[StickerContour]) -> List[StickerSample]:
        samples: list[StickerSample] = []
        hsv_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

        for sticker in stickers:
            x, y, w, h = sticker.bbox
            crop_w = max(3, int(w * self.center_crop_ratio))
            crop_h = max(3, int(h * self.center_crop_ratio))
            cx = x + w // 2
            cy = y + h // 2
            x1 = max(0, cx - crop_w // 2)
            y1 = max(0, cy - crop_h // 2)
            x2 = min(frame_bgr.shape[1], x1 + crop_w)
            y2 = min(frame_bgr.shape[0], y1 + crop_h)

            hsv_patch = hsv_frame[y1:y2, x1:x2]
            rgb_patch = rgb_frame[y1:y2, x1:x2]
            hsv_average = np.median(hsv_patch.reshape(-1, 3), axis=0).astype(np.uint8)
            rgb_average = np.mean(rgb_patch.reshape(-1, 3), axis=0).astype(np.uint8)
            samples.append(StickerSample(sticker.row, sticker.col, sticker.bbox, hsv_average, rgb_average))

        return sorted(samples, key=lambda sample: (sample.row, sample.col))

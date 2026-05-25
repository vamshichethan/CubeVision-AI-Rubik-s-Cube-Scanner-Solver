from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Dict, List

import numpy as np

from .color_classifier import ColorClassifier
from .face_detector import FaceDetector
from .sticker_extractor import StickerExtractor


FACE_LABELS = ["U", "D", "F", "B", "L", "R"]
LOW_CONFIDENCE_THRESHOLD = 0.72


@dataclass(frozen=True)
class ScannedSticker:
    row: int
    col: int
    color: str
    confidence: float
    hsv: tuple[int, int, int]
    rgb_preview: tuple[int, int, int]


@dataclass
class FaceScanResult:
    face: str
    ok: bool
    stickers: List[ScannedSticker]
    message: str
    needs_manual_correction: bool

    def to_dict(self) -> dict:
        return asdict(self)


class ScanSession:
    """Coordinates all scanner stages and stores six scanned faces."""

    def __init__(
        self,
        detector: FaceDetector | None = None,
        extractor: StickerExtractor | None = None,
        classifier: ColorClassifier | None = None,
    ) -> None:
        self.detector = detector or FaceDetector()
        self.extractor = extractor or StickerExtractor()
        self.classifier = classifier or ColorClassifier()
        self.faces: Dict[str, FaceScanResult] = {}

    def scan_face(self, frame_bgr: np.ndarray, face: str) -> FaceScanResult:
        face = face.upper()
        detection = self.detector.detect(frame_bgr)
        if not detection.ok:
            return FaceScanResult(face, False, [], detection.message, True)

        samples = self.extractor.extract(frame_bgr, detection.stickers)
        scanned: list[ScannedSticker] = []
        for sample in samples:
            prediction = self.classifier.classify(sample.hsv, sample.rgb_preview)
            scanned.append(
                ScannedSticker(
                    row=sample.row,
                    col=sample.col,
                    color=prediction.color,
                    confidence=round(prediction.confidence, 3),
                    hsv=prediction.hsv,
                    rgb_preview=prediction.rgb_preview,
                )
            )

        needs_manual = any(sticker.confidence < LOW_CONFIDENCE_THRESHOLD for sticker in scanned)
        result = FaceScanResult(
            face=face,
            ok=len(scanned) == 9,
            stickers=scanned,
            message="Low confidence stickers need manual correction." if needs_manual else "Face scan accepted.",
            needs_manual_correction=needs_manual,
        )
        self.faces[face] = result
        return result

    def complete_cube_state(self) -> dict:
        return {face: [sticker.color for sticker in self.faces[face].stickers] for face in FACE_LABELS if face in self.faces}

    def validate_complete(self) -> dict:
        counts = {color: 0 for color in ["WHITE", "YELLOW", "RED", "ORANGE", "BLUE", "GREEN"]}
        centers: list[str] = []
        errors: list[str] = []

        for face in FACE_LABELS:
            result = self.faces.get(face)
            if result is None:
                errors.append(f"Missing face {face}.")
                continue
            if len(result.stickers) != 9:
                errors.append(f"Face {face} has {len(result.stickers)} stickers; expected 9.")
                continue
            for sticker in result.stickers:
                counts[sticker.color] = counts.get(sticker.color, 0) + 1
            centers.append(result.stickers[4].color)

        for color, count in counts.items():
            if count != 9:
                errors.append(f"{color} appears {count} times; expected 9.")

        if len(set(centers)) != len(centers):
            errors.append("Center colors must be unique.")

        return {"valid": len(errors) == 0, "errors": errors, "counts": counts}

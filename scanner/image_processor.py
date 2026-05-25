from __future__ import annotations

import numpy as np

from .scan_session import FaceScanResult, ScanSession


class ImageProcessor:
    """Single-image scanner facade used by API and tests."""

    def __init__(self, session: ScanSession | None = None) -> None:
        self.session = session or ScanSession()

    def process_face_image(self, image_bgr: np.ndarray, face: str) -> FaceScanResult:
        return self.session.scan_face(image_bgr, face)

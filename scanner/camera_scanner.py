from __future__ import annotations

import cv2

from .scan_session import FACE_LABELS, ScanSession


class CameraScanner:
    """Interactive webcam scanner for scanning all six cube faces."""

    def __init__(self, camera_index: int = 0, debug: bool = False) -> None:
        self.camera_index = camera_index
        self.debug = debug
        self.session = ScanSession()

    def run(self) -> None:
        capture = cv2.VideoCapture(self.camera_index)
        if not capture.isOpened():
            raise RuntimeError(f"Unable to open camera index {self.camera_index}")

        try:
            for face in FACE_LABELS:
                self._scan_single_face(capture, face)
            print(self.session.validate_complete())
        finally:
            capture.release()
            cv2.destroyAllWindows()

    def _scan_single_face(self, capture: cv2.VideoCapture, face: str) -> None:
        print(f"Show {face} face. Press SPACE to capture, ESC to quit.")
        while True:
            ok, frame = capture.read()
            if not ok:
                raise RuntimeError("Camera frame could not be read.")

            preview = frame.copy()
            cv2.putText(preview, f"Scanning face {face}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.imshow("CubeVision Scanner", preview)
            key = cv2.waitKey(1) & 0xFF

            if key == 27:
                raise KeyboardInterrupt("Scanner cancelled.")
            if key == 32:
                result = self.session.scan_face(frame, face)
                print(result.to_dict())
                if result.ok:
                    return
                print("Detection weak. Retake the face.")

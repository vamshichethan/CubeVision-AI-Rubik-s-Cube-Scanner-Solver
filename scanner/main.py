from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2

from .camera_scanner import CameraScanner
from .scan_session import ScanSession


def scan_image(path: Path, face: str, debug: bool) -> None:
    image = cv2.imread(str(path))
    if image is None:
        raise FileNotFoundError(f"Could not read image: {path}")

    session = ScanSession()
    result = session.scan_face(image, face)
    print(json.dumps(result.to_dict(), indent=2))

    if debug:
        detection = session.detector.detect(image)
        cv2.imshow("original", image)
        cv2.imshow("threshold mask", detection.mask)
        cv2.imshow("detected stickers", detection.debug_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


def main() -> None:
    parser = argparse.ArgumentParser(description="CubeVision AI OpenCV scanner")
    parser.add_argument("--camera", type=int, default=None, help="Open webcam index")
    parser.add_argument("--image", type=Path, help="Scan a sample image")
    parser.add_argument("--face", default="U", choices=["U", "D", "F", "B", "L", "R"])
    parser.add_argument("--debug", action="store_true", help="Show debug OpenCV windows")
    args = parser.parse_args()

    if args.image:
        scan_image(args.image, args.face, args.debug)
        return

    CameraScanner(camera_index=args.camera or 0, debug=args.debug).run()


if __name__ == "__main__":
    main()

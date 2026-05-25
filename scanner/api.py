from __future__ import annotations

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile

from .calibration_manager import CalibrationManager
from .image_processor import ImageProcessor
from .scan_session import ScanSession


app = FastAPI(title="CubeVision AI Scanner")
session = ScanSession()
calibration = CalibrationManager()
processor = ImageProcessor(session)


async def _decode_upload(file: UploadFile) -> np.ndarray:
    data = await file.read()
    array = np.frombuffer(data, np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image.")
    return image


@app.post("/scan-face")
async def scan_face(face: str = Form(...), frame: UploadFile = File(...)) -> dict:
    image = await _decode_upload(frame)
    return session.scan_face(image, face).to_dict()


@app.post("/scan-image")
async def scan_image(face: str = Form(...), image: UploadFile = File(...)) -> dict:
    frame = await _decode_upload(image)
    result = processor.process_face_image(frame, face)
    return {
        "face": result.face,
        "success": result.ok,
        "stickers": [
            {
                "row": sticker.row,
                "col": sticker.col,
                "color": sticker.color,
                "confidence": sticker.confidence,
            }
            for sticker in result.stickers
        ],
        "needsManualCorrection": result.needs_manual_correction,
        "message": result.message,
    }


@app.post("/calibrate")
async def calibrate(profile: dict) -> dict:
    references = {
        color: np.array(hsv, dtype=np.uint8)
        for color, hsv in profile.get("references", {}).items()
    }
    updated = calibration.update_from_centers(references)
    return {"profile": updated.references}


@app.post("/scan-complete")
async def scan_complete(faces: dict | None = None) -> dict:
    if faces:
        return {"cubeState": faces, "validation": session.validate_complete()}
    return {"cubeState": session.complete_cube_state(), "validation": session.validate_complete()}


@app.post("/validate-cube")
async def validate_cube(payload: dict) -> dict:
    faces = payload.get("faces", {})
    counts = {color: 0 for color in ["WHITE", "YELLOW", "RED", "ORANGE", "BLUE", "GREEN"]}
    errors: list[str] = []
    centers: list[str] = []

    for face in ["U", "D", "F", "B", "L", "R"]:
      stickers = faces.get(face, [])
      if len(stickers) != 9:
          errors.append(f"Face {face} has {len(stickers)} stickers, expected 9.")
          continue
      centers.append(stickers[4])
      for color in stickers:
          counts[color] = counts.get(color, 0) + 1

    for color, count in counts.items():
        if count != 9:
            errors.append(f"{color} appears {count} times, expected 9.")

    if len(centers) == 6 and len(set(centers)) != 6:
        errors.append("Center colors must be unique.")

    return {"valid": len(errors) == 0, "errors": errors, "counts": counts}

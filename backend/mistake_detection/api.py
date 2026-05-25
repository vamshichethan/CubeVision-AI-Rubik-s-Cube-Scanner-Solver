from __future__ import annotations

from fastapi import FastAPI

from .mistake_detector import MistakeDetector


app = FastAPI(title="CubeVision AI Mistake Detection")
detector = MistakeDetector()


@app.post("/verify-move")
async def verify_move(payload: dict) -> dict:
    # This endpoint is API-shaped for future backend integration. In production,
    # apply_move will call the shared C++/WASM cube engine.
    def passthrough_apply_move(state: dict, _move: str) -> dict:
        return state

    result = detector.verify_move(
        previous_state=payload["previousState"],
        expected_state=payload["expectedState"],
        actual_state=payload["actualState"],
        expected_move=payload["expectedMove"],
        apply_move=passthrough_apply_move,
        scan_confidences=payload.get("scanConfidences"),
    )
    return result.to_dict()

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RecoveryPlan:
    options: list[str]
    suggested_action: str
    message: str


class RecoveryManager:
    def plan(self, detected_move: str | None, confidence: float, severity: str) -> RecoveryPlan:
        if detected_move and confidence >= 0.85:
            return RecoveryPlan(
                options=["Undo move", "Recalculate solution"],
                suggested_action="Undo move",
                message=f"Detected a likely wrong move: {detected_move}. Undoing is safest.",
            )

        if severity == "partial":
            return RecoveryPlan(
                options=["Manual correction", "Retake scan", "Recalculate solution"],
                suggested_action="Manual correction",
                message="State is close, but scan noise or a small correction is likely.",
            )

        return RecoveryPlan(
            options=["Retake scan", "Recalculate solution"],
            suggested_action="Retake scan",
            message="Mismatch is large; retake the scan before recalculating.",
        )

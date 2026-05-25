from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Callable

from .move_inference_engine import MoveInferenceEngine
from .recovery_manager import RecoveryManager
from .scan_consistency_checker import ScanConsistencyChecker
from .state_comparator import CubeState, StateComparator


MoveApplier = Callable[[CubeState, str], CubeState]


@dataclass(frozen=True)
class MistakeDetectionResult:
    match: bool
    detected_move: str | None
    confidence: float
    recovery_options: list[str]
    suggested_action: str
    message: str
    mismatched_stickers: int
    scan_usable: bool

    def to_dict(self) -> dict:
        return asdict(self)


class MistakeDetector:
    def __init__(self) -> None:
        self.comparator = StateComparator()
        self.inference = MoveInferenceEngine(self.comparator)
        self.recovery = RecoveryManager()
        self.scan_checker = ScanConsistencyChecker()

    def verify_move(
        self,
        previous_state: CubeState,
        expected_state: CubeState,
        actual_state: CubeState,
        expected_move: str,
        apply_move: MoveApplier,
        scan_confidences: list[float] | None = None,
    ) -> MistakeDetectionResult:
        scan_quality = self.scan_checker.check(scan_confidences or [0.92] * 54)
        comparison = self.comparator.compare(expected_state, actual_state)
        if comparison.match and scan_quality.usable:
            return MistakeDetectionResult(
                match=True,
                detected_move=expected_move,
                confidence=scan_quality.confidence,
                recovery_options=[],
                suggested_action="Continue",
                message="Move verified. Continue to the next step.",
                mismatched_stickers=0,
                scan_usable=True,
            )

        inferred = self.inference.infer(previous_state, actual_state, expected_move, apply_move)
        plan = self.recovery.plan(inferred.detected_move, inferred.confidence, comparison.severity)
        return MistakeDetectionResult(
            match=False,
            detected_move=inferred.detected_move,
            confidence=round(min(inferred.confidence, scan_quality.confidence), 3),
            recovery_options=plan.options,
            suggested_action=plan.suggested_action,
            message=plan.message,
            mismatched_stickers=len(comparison.mismatches),
            scan_usable=scan_quality.usable,
        )

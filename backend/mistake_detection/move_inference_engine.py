from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, List

from .state_comparator import CubeState, StateComparator


MoveApplier = Callable[[CubeState, str], CubeState]


@dataclass(frozen=True)
class MoveInference:
    detected_move: str | None
    confidence: float
    notes: str


class MoveInferenceEngine:
    """Searches nearby move candidates and picks the closest resulting state."""

    CANDIDATES = ["R", "R'", "L", "L'", "U", "U'", "D", "D'", "F", "F'", "B", "B'"]

    def __init__(self, comparator: StateComparator | None = None) -> None:
        self.comparator = comparator or StateComparator()

    def infer(
        self,
        previous_state: CubeState,
        actual_state: CubeState,
        expected_move: str,
        apply_move: MoveApplier,
    ) -> MoveInference:
        best_move: str | None = None
        best_score = -1.0

        # Candidate move search: apply each nearby legal face turn to the
        # previous verified state and compare it with the scanned state.
        for candidate in self.CANDIDATES:
            candidate_state = apply_move(previous_state, candidate)
            score = self.comparator.compare(candidate_state, actual_state).match_percentage
            if score > best_score:
                best_score = score
                best_move = candidate

        if best_move == expected_move and best_score >= 0.98:
            return MoveInference(best_move, best_score, "Scanned state matches the expected move.")
        if best_score >= 0.75:
            return MoveInference(best_move, best_score, f"Likely performed {best_move} instead of {expected_move}.")
        return MoveInference(None, best_score, "No nearby move explains the scanned state confidently.")

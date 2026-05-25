from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, List

from .state_comparator import CubeState


MoveApplier = Callable[[CubeState, str], CubeState]


@dataclass
class ExpectedStateTracker:
    current_state: CubeState
    remaining_solution: List[str]
    move_history: List[str] = field(default_factory=list)

    def expected_move(self) -> str | None:
        return self.remaining_solution[0] if self.remaining_solution else None

    def advance(self, apply_move: MoveApplier) -> None:
        move = self.expected_move()
        if move is None:
            return
        self.current_state = apply_move(self.current_state, move)
        self.move_history.append(move)
        self.remaining_solution = self.remaining_solution[1:]

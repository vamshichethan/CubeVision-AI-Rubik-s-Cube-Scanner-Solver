from __future__ import annotations

from .state_comparator import CubeState


class SolutionRecalculator:
    """Placeholder bridge for C++/WASM/backend solving from the current state."""

    def recalculate(self, current_state: CubeState) -> list[str]:
        # Future implementation will call the real solver with current_state.
        _ = current_state
        return ["R", "U", "R'", "U'", "F'"]

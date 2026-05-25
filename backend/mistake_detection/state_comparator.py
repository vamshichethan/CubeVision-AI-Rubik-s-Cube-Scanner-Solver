from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


CubeState = Dict[str, List[str]]


@dataclass(frozen=True)
class StateComparison:
    match: bool
    sticker_matches: int
    sticker_total: int
    match_percentage: float
    mismatches: list[dict]
    severity: str


class StateComparator:
    """Compares expected and scanned states sticker-by-sticker."""

    def compare(self, expected_state: CubeState, actual_state: CubeState) -> StateComparison:
        mismatches: list[dict] = []
        matches = 0
        total = 0

        for face, expected_stickers in expected_state.items():
            actual_stickers = actual_state.get(face, [])
            for index, expected_color in enumerate(expected_stickers):
                actual_color = actual_stickers[index] if index < len(actual_stickers) else None
                total += 1
                if actual_color == expected_color:
                    matches += 1
                else:
                    mismatches.append(
                        {
                            "face": face,
                            "index": index,
                            "expected": expected_color,
                            "actual": actual_color,
                        }
                    )

        percentage = matches / total if total else 0.0
        if percentage >= 0.98:
            severity = "exact"
        elif percentage >= 0.82:
            severity = "partial"
        else:
            severity = "large"

        return StateComparison(
            match=len(mismatches) == 0,
            sticker_matches=matches,
            sticker_total=total,
            match_percentage=round(percentage, 4),
            mismatches=mismatches,
            severity=severity,
        )

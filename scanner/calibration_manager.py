from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Mapping

import numpy as np


ColorName = str


DEFAULT_REFERENCES: Dict[ColorName, tuple[int, int, int]] = {
    "WHITE": (0, 0, 235),
    "YELLOW": (30, 210, 230),
    "RED": (0, 220, 210),
    "ORANGE": (15, 220, 225),
    "BLUE": (110, 220, 180),
    "GREEN": (60, 210, 180),
}


@dataclass
class CalibrationProfile:
    references: Dict[ColorName, tuple[int, int, int]]
    hue_tolerance: int = 12
    saturation_tolerance: int = 75
    value_tolerance: int = 80


class CalibrationManager:
    """Stores center-sticker HSV references and persists them locally."""

    def __init__(self, profile_path: str | Path = "scanner/calibration_profile.json") -> None:
        self.profile_path = Path(profile_path)
        self.profile = self.load()

    def load(self) -> CalibrationProfile:
        if not self.profile_path.exists():
            return CalibrationProfile(references=dict(DEFAULT_REFERENCES))

        data = json.loads(self.profile_path.read_text(encoding="utf-8"))
        refs = {key: tuple(value) for key, value in data["references"].items()}
        return CalibrationProfile(
            references=refs,
            hue_tolerance=int(data.get("hue_tolerance", 12)),
            saturation_tolerance=int(data.get("saturation_tolerance", 75)),
            value_tolerance=int(data.get("value_tolerance", 80)),
        )

    def save(self) -> None:
        self.profile_path.parent.mkdir(parents=True, exist_ok=True)
        self.profile_path.write_text(json.dumps(asdict(self.profile), indent=2), encoding="utf-8")

    def update_from_centers(self, references: Mapping[ColorName, np.ndarray]) -> CalibrationProfile:
        cleaned = {
            color.upper(): tuple(int(channel) for channel in hsv[:3])
            for color, hsv in references.items()
        }
        self.profile = CalibrationProfile(references={**self.profile.references, **cleaned})
        self.save()
        return self.profile

    def reference_array(self, color: ColorName) -> np.ndarray:
        return np.array(self.profile.references[color.upper()], dtype=np.uint8)

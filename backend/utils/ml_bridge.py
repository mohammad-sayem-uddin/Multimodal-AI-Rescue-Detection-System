import sys
from pathlib import Path


def _ml_path() -> Path:
    return Path(__file__).resolve().parents[2] / "ml"


def get_detector():
    ml_path = _ml_path()
    if str(ml_path) not in sys.path:
        sys.path.append(str(ml_path))

    from detector import Detector

    return Detector()

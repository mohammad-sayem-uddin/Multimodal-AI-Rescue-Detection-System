from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Any

import cv2


Detection = dict[str, Any]
BOX_COLOR = (40, 220, 140)
LABEL = "person"
_SIMULATOR = None


def detect_people(frame) -> tuple[list[Detection], Any]:
    """
    Simulate realistic human detections with slight temporal motion.

    The public API stays simple so this module can later be replaced by a real
    detector such as YOLO without affecting the rest of the pipeline.
    """
    if frame is None:
        raise ValueError("frame must not be None")

    simulator = _get_simulator()
    detections = simulator.next_detections(frame)
    annotated_frame = frame.copy()

    for detection in detections:
        _draw_detection(annotated_frame, detection)

    return detections, annotated_frame


class DummyModel:
    """
    Adapter with the same shape a real detector class would expose later.
    """

    def predict(self, frame) -> tuple[list[Detection], Any]:
        return detect_people(frame)


@dataclass
class SimulatedTrack:
    center_x: float
    center_y: float
    width: int
    height: int
    confidence: float
    velocity_x: float
    velocity_y: float


class DetectionSimulator:
    def __init__(self) -> None:
        self.tracks: list[SimulatedTrack] = []
        self.frame_signature: tuple[int, int] | None = None

    def next_detections(self, frame) -> list[Detection]:
        frame_height, frame_width = frame.shape[:2]
        signature = (frame_width, frame_height)

        if self.frame_signature != signature:
            self.frame_signature = signature
            self.tracks = []

        self._initialize_tracks_if_needed(frame_width, frame_height)
        self._update_tracks(frame_width, frame_height)

        return [self._track_to_detection(track, frame_width, frame_height) for track in self.tracks]

    def _initialize_tracks_if_needed(self, frame_width: int, frame_height: int) -> None:
        if self.tracks:
            if len(self.tracks) > 1 and random.random() < 0.04:
                self.tracks.pop()
            elif len(self.tracks) < 3 and random.random() < 0.05:
                self.tracks.append(self._create_track(frame_width, frame_height))
            return

        target_count = random.choice((1, 2, 2, 3))
        self.tracks = [self._create_track(frame_width, frame_height) for _ in range(target_count)]

    def _create_track(self, frame_width: int, frame_height: int) -> SimulatedTrack:
        width = random.randint(max(28, frame_width // 20), max(42, frame_width // 10))
        height = int(width * random.uniform(1.9, 2.35))
        height = min(height, max(72, frame_height // 3))

        center_x = random.uniform(frame_width * 0.28, frame_width * 0.72)
        center_y = random.uniform(frame_height * 0.42, frame_height * 0.78)
        confidence = round(random.uniform(0.68, 0.86), 2)

        return SimulatedTrack(
            center_x=center_x,
            center_y=center_y,
            width=width,
            height=height,
            confidence=confidence,
            velocity_x=random.uniform(-2.0, 2.0),
            velocity_y=random.uniform(-1.2, 1.2),
        )

    def _update_tracks(self, frame_width: int, frame_height: int) -> None:
        for track in self.tracks:
            track.velocity_x += random.uniform(-0.35, 0.35)
            track.velocity_y += random.uniform(-0.2, 0.2)
            track.velocity_x = _clamp(track.velocity_x, -3.0, 3.0)
            track.velocity_y = _clamp(track.velocity_y, -1.8, 1.8)

            track.center_x += track.velocity_x
            track.center_y += track.velocity_y

            min_center_x = frame_width * 0.18
            max_center_x = frame_width * 0.82
            min_center_y = frame_height * 0.30
            max_center_y = frame_height * 0.86

            if track.center_x < min_center_x or track.center_x > max_center_x:
                track.velocity_x *= -0.8
                track.center_x = _clamp(track.center_x, min_center_x, max_center_x)

            if track.center_y < min_center_y or track.center_y > max_center_y:
                track.velocity_y *= -0.8
                track.center_y = _clamp(track.center_y, min_center_y, max_center_y)

            track.confidence += random.uniform(-0.02, 0.02)
            track.confidence = round(_clamp(track.confidence, 0.6, 0.9), 2)

    def _track_to_detection(
        self,
        track: SimulatedTrack,
        frame_width: int,
        frame_height: int,
    ) -> Detection:
        x = int(track.center_x - track.width / 2)
        y = int(track.center_y - track.height / 2)

        x = max(0, min(x, frame_width - track.width))
        y = max(0, min(y, frame_height - track.height))

        return {
            "label": LABEL,
            "confidence": track.confidence,
            "bbox": [x, y, track.width, track.height],
        }


def _get_simulator() -> DetectionSimulator:
    global _SIMULATOR
    if _SIMULATOR is None:
        _SIMULATOR = DetectionSimulator()
    return _SIMULATOR


def _draw_detection(frame, detection: Detection) -> None:
    x, y, width, height = detection["bbox"]
    label = f'{LABEL} {detection["confidence"]:.2f}'

    cv2.rectangle(frame, (x, y), (x + width, y + height), BOX_COLOR, 2)
    cv2.putText(
        frame,
        label,
        (x, max(20, y - 10)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        BOX_COLOR,
        2,
        cv2.LINE_AA,
    )


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(value, upper))

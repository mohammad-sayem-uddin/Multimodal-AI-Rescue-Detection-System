from __future__ import annotations

import argparse
import base64
import json
import logging
import os
import platform
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, request

import cv2

try:
    import websocket  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    websocket = None


LOGGER = logging.getLogger("rescue_drone.detector")
BOX_COLOR = (40, 220, 140)
Detection = dict[str, Any]
DEFAULT_MODEL_PATH = "yolov8s.pt"


@dataclass
class StreamConfig:
    source: int | str = 0
    backend_mode: str = "websocket"
    backend_url: str = "http://localhost:8000/detect"
    websocket_url: str = "ws://localhost:8000/ws/detect"
    target_fps: float = 12.0
    display: bool = True
    window_name: str = "RESCUE_DRONE Monitor"
    fallback_video: str | None = None
    model_path: str = DEFAULT_MODEL_PATH
    image_size: int = 640
    confidence_threshold: float = 0.4
    device: str | None = None


class BackendPublisher:
    def publish(self, payload: dict[str, Any]) -> None:
        raise NotImplementedError

    def close(self) -> None:
        return


class RestPublisher(BackendPublisher):
    def __init__(self, url: str) -> None:
        self.url = url

    def publish(self, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        http_request = request.Request(
            self.url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(http_request, timeout=1.0):
                pass
        except (error.URLError, TimeoutError) as exc:
            LOGGER.debug("Skipping REST publish because backend is unavailable: %s", exc)


class WebSocketPublisher(BackendPublisher):
    def __init__(self, url: str) -> None:
        self.url = url
        self.connection = None
        self.has_warned_missing_library = False
        self.last_error_message: str | None = None

    def publish(self, payload: dict[str, Any]) -> None:
        if websocket is None:
            if not self.has_warned_missing_library:
                LOGGER.error(
                    "WebSocket streaming unavailable: install websocket-client to enable "
                    "ML -> backend streaming."
                )
                self.has_warned_missing_library = True
            return

        try:
            if self.connection is None:
                LOGGER.info("Connecting ML stream to %s", self.url)
                self.connection = websocket.create_connection(self.url, timeout=1.0)
                self.connection.settimeout(0.25)
                try:
                    handshake = self.connection.recv()
                    LOGGER.debug("WebSocket handshake received: %s", handshake)
                except Exception:
                    pass
            self.connection.send(json.dumps(payload))
            self.last_error_message = None
        except Exception as exc:  # pragma: no cover - network dependent
            error_message = str(exc)
            if error_message != self.last_error_message:
                LOGGER.warning(
                    "WebSocket publish failed. Retrying on next frame: %s",
                    error_message,
                )
                self.last_error_message = error_message
            self.close()

    def close(self) -> None:
        if self.connection is not None:
            try:
                self.connection.close()
            except Exception:
                pass
            self.connection = None


class YOLOPersonDetector:
    """
    YOLOv8-backed detector that preserves the existing downstream payload shape.
    """

    def __init__(
        self,
        model_path: str = DEFAULT_MODEL_PATH,
        image_size: int = 640,
        confidence_threshold: float = 0.4,
        device: str | None = None,
    ) -> None:
        self.model_path = model_path
        self.image_size = image_size
        self.confidence_threshold = confidence_threshold
        self.device = device
        self.model = self._load_model(model_path)
        LOGGER.info("Loaded YOLO model: %s", model_path)

    def predict(self, frame) -> tuple[list[Detection], Any]:
        annotated_frame = frame.copy()
        frame_height, frame_width = annotated_frame.shape[:2]

        results = self.model(
            frame,
            imgsz=self.image_size,
            conf=self.confidence_threshold,
            classes=[0],
            device=self.device,
            verbose=False,
        )

        detections: list[Detection] = []
        if not results:
            return detections, annotated_frame

        result = results[0]
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            return detections, annotated_frame

        for box in boxes:
            xyxy = box.xyxy[0].tolist()
            confidence = float(box.conf[0].item())

            x1 = max(0, min(int(xyxy[0]), frame_width - 1))
            y1 = max(0, min(int(xyxy[1]), frame_height - 1))
            x2 = max(0, min(int(xyxy[2]), frame_width - 1))
            y2 = max(0, min(int(xyxy[3]), frame_height - 1))

            width = max(1, x2 - x1)
            height = max(1, y2 - y1)

            detection = {
                "label": "person",
                "confidence": round(confidence, 4),
                "bbox": [x1, y1, width, height],
            }
            detections.append(detection)
            _draw_detection(annotated_frame, detection)

        return detections, annotated_frame

    def _load_model(self, model_path: str):
        try:
            from ultralytics import YOLO
        except ImportError as exc:  # pragma: no cover - depends on env
            raise RuntimeError(
                "ultralytics is not installed. Install it with "
                "`pip install ultralytics` or `pip install -r ml/requirements.txt`."
            ) from exc

        return YOLO(model_path)


class Detector:
    """
    Video detector pipeline with pluggable model and optional backend publishing.
    """

    def __init__(
        self,
        model: Any,
        publisher: BackendPublisher | None = None,
    ) -> None:
        self.model = model
        self.publisher = publisher
        self.frame_index = 0

    def process_frame(self, frame) -> dict[str, Any]:
        detections, annotated_frame = self.model.predict(frame)
        frame_height, frame_width = frame.shape[:2]
        encoded_frame = _encode_frame_to_base64(annotated_frame)

        payload = {
            "source": "ml-video-pipeline",
            "timestamp": time.time(),
            "detection_count": len(detections),
            "frame": encoded_frame,
            "detections": detections,
            "metadata": {
                "frame_size": {
                    "width": frame_width,
                    "height": frame_height,
                },
                "stream_transport": self._transport_label(),
                "model_name": _display_model_name(getattr(self.model, "model_path", DEFAULT_MODEL_PATH)),
            },
        }

        if self.publisher is not None:
            self.publisher.publish(payload)

        return {
            "detections": detections,
            "annotated_frame": annotated_frame,
            "metadata": payload,
        }

    def _transport_label(self) -> str:
        if isinstance(self.publisher, WebSocketPublisher):
            return "websocket"
        if isinstance(self.publisher, RestPublisher):
            return "rest"
        return "local"

    def start_video_stream(self, config: StreamConfig | None = None) -> None:
        stream_config = config or StreamConfig()

        LOGGER.info("Starting RESCUE_DRONE detector")
        LOGGER.info("Requested source: %s", stream_config.source)
        LOGGER.info("YOLO model: %s", stream_config.model_path)
        LOGGER.info("Inference size: %s", stream_config.image_size)
        if stream_config.display:
            LOGGER.info("Display window enabled. Press 'q' to quit.")
        else:
            LOGGER.info("Display window disabled. Running headless.")

        capture, resolved_source = _open_video_source(stream_config)
        LOGGER.info("Video source opened: %s", resolved_source)

        if stream_config.display:
            cv2.namedWindow(stream_config.window_name, cv2.WINDOW_NORMAL)

        frame_interval = 1.0 / max(stream_config.target_fps, 1.0)

        try:
            while True:
                loop_started_at = time.perf_counter()
                ok, frame = capture.read()
                if not ok or frame is None:
                    LOGGER.error("Failed to read frame from source: %s", resolved_source)
                    break

                result = self.process_frame(frame)
                detections = result["detections"]
                annotated_frame = result["annotated_frame"]
                self.frame_index += 1
                if self.frame_index == 1 or self.frame_index % 30 == 0:
                    LOGGER.info("YOLO inference running")
                    LOGGER.info(
                        "Frame %s processed with %s person detections",
                        self.frame_index,
                        len(detections),
                    )

                if stream_config.display:
                    cv2.imshow(stream_config.window_name, annotated_frame)
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord("q"):
                        LOGGER.info("Exit requested by user.")
                        break

                elapsed = time.perf_counter() - loop_started_at
                remaining = frame_interval - elapsed
                if remaining > 0:
                    time.sleep(remaining)
        finally:
            capture.release()
            cv2.destroyAllWindows()
            if self.publisher is not None:
                self.publisher.close()
            LOGGER.info("Video stream stopped.")


def process_frame(
    frame,
    model_path: str = DEFAULT_MODEL_PATH,
    image_size: int = 640,
    confidence_threshold: float = 0.4,
    device: str | None = None,
) -> dict[str, Any]:
    model = YOLOPersonDetector(
        model_path=model_path,
        image_size=image_size,
        confidence_threshold=confidence_threshold,
        device=device,
    )
    detector = Detector(model=model)
    return detector.process_frame(frame)


def start_video_stream(
    source: int | str = 0,
    backend_mode: str = "websocket",
    backend_url: str = "http://localhost:8000/detect",
    websocket_url: str = "ws://localhost:8000/ws/detect",
    target_fps: float = 12.0,
    display: bool = True,
    fallback_video: str | None = None,
    model_path: str = DEFAULT_MODEL_PATH,
    image_size: int = 640,
    confidence_threshold: float = 0.4,
    device: str | None = None,
) -> None:
    config = StreamConfig(
        source=source,
        backend_mode=backend_mode,
        backend_url=backend_url,
        websocket_url=websocket_url,
        target_fps=target_fps,
        display=display,
        fallback_video=fallback_video,
        model_path=model_path,
        image_size=image_size,
        confidence_threshold=confidence_threshold,
        device=device,
    )
    publisher = _build_publisher(config)
    model = YOLOPersonDetector(
        model_path=config.model_path,
        image_size=config.image_size,
        confidence_threshold=config.confidence_threshold,
        device=config.device,
    )
    detector = Detector(model=model, publisher=publisher)
    detector.start_video_stream(config)


def _build_publisher(config: StreamConfig) -> BackendPublisher | None:
    if config.backend_mode == "websocket":
        return WebSocketPublisher(config.websocket_url)
    if config.backend_mode == "rest":
        return RestPublisher(config.backend_url)
    return None


def _open_video_source(config: StreamConfig):
    attempts = _build_capture_attempts(config)
    errors: list[str] = []

    for label, source, backend in attempts:
        LOGGER.info("Trying video source: %s", label)
        if backend is None:
            capture = cv2.VideoCapture(source)
        else:
            capture = cv2.VideoCapture(source, backend)

        if capture.isOpened():
            return capture, label

        capture.release()
        errors.append(label)
        LOGGER.warning("Unable to open video source: %s", label)

    message = [
        "Could not open webcam or fallback video.",
        f"Tried sources: {', '.join(errors) if errors else 'none'}",
    ]
    if platform.system() == "Darwin":
        message.append(
            "On macOS, make sure Terminal or your IDE has Camera permission in "
            "System Settings > Privacy & Security > Camera."
        )
    raise RuntimeError(" ".join(message))


def _build_capture_attempts(config: StreamConfig) -> list[tuple[str, int | str, int | None]]:
    attempts: list[tuple[str, int | str, int | None]] = []
    source = config.source

    if isinstance(source, int):
        if platform.system() == "Darwin":
            attempts.append(
                (f"webcam index {source} via AVFoundation", source, cv2.CAP_AVFOUNDATION)
            )
        attempts.append((f"webcam index {source}", source, None))
    else:
        attempts.append((f"video file {source}", source, None))

    fallback_video = config.fallback_video or _discover_fallback_video()
    if fallback_video and (not isinstance(source, str) or source != fallback_video):
        attempts.append((f"fallback video {fallback_video}", fallback_video, None))

    return attempts


def _discover_fallback_video() -> str | None:
    sample_dir = Path(__file__).resolve().parents[1] / "assets" / "sample_videos"
    if not sample_dir.exists():
        return None

    for pattern in ("*.mp4", "*.mov", "*.avi", "*.mkv"):
        matches = sorted(sample_dir.glob(pattern))
        if matches:
            return str(matches[0])
    return None


def _draw_detection(frame, detection: Detection) -> None:
    x, y, width, height = detection["bbox"]
    label = f'{detection["label"]} {detection["confidence"]:.2f}'

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


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the RESCUE_DRONE YOLO detector.")
    parser.add_argument(
        "--source",
        default="0",
        help="Webcam index or path to a video file. Default: 0",
    )
    parser.add_argument(
        "--backend-mode",
        choices=("none", "rest", "websocket"),
        default="websocket",
        help="Optional backend publishing mode.",
    )
    parser.add_argument(
        "--display",
        dest="display",
        action="store_true",
        default=True,
        help="Show the OpenCV window.",
    )
    parser.add_argument(
        "--no-display",
        dest="display",
        action="store_false",
        help="Disable the OpenCV window.",
    )
    parser.add_argument(
        "--target-fps",
        type=float,
        default=12.0,
        help="Limit processing speed for smoother realtime streaming.",
    )
    parser.add_argument(
        "--websocket-url",
        default="ws://localhost:8000/ws/detect",
        help="Backend WebSocket URL for realtime detection streaming.",
    )
    parser.add_argument(
        "--fallback-video",
        default=None,
        help="Optional fallback video file if webcam access fails.",
    )
    parser.add_argument(
        "--model-path",
        default=os.getenv("YOLO_MODEL_PATH", DEFAULT_MODEL_PATH),
        help="YOLO model path or model alias. Defaults to yolov8s.pt",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="YOLO inference size. Lower values are faster.",
    )
    parser.add_argument(
        "--conf-threshold",
        type=float,
        default=0.4,
        help="Confidence threshold for person detections.",
    )
    parser.add_argument(
        "--device",
        default=None,
        help="Torch device override, for example cpu, mps, or 0.",
    )
    return parser.parse_args()


def _normalize_source(raw_source: str) -> int | str:
    try:
        return int(raw_source)
    except ValueError:
        return raw_source


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


def _encode_frame_to_base64(frame) -> str | None:
    ok, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 72])
    if not ok:
        LOGGER.warning("Failed to encode frame to JPEG for websocket streaming.")
        return None

    encoded = base64.b64encode(buffer.tobytes()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def _display_model_name(model_path: str) -> str:
    model_name = Path(model_path).name.lower()
    if model_name == "yolov8s.pt":
        return "YOLOv8s"
    if model_name == "yolov8n.pt":
        return "YOLOv8n"
    return Path(model_path).stem


if __name__ == "__main__":
    _configure_logging()
    arguments = _parse_args()

    try:
        start_video_stream(
            source=_normalize_source(arguments.source),
            backend_mode=arguments.backend_mode,
            target_fps=arguments.target_fps,
            display=arguments.display,
            fallback_video=arguments.fallback_video,
            websocket_url=arguments.websocket_url,
            model_path=arguments.model_path,
            image_size=arguments.imgsz,
            confidence_threshold=arguments.conf_threshold,
            device=arguments.device,
        )
    except Exception as exc:
        LOGGER.error("%s", exc)
        raise

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
LOGGER = logging.getLogger("rescue_drone.websocket")


class DetectionWebSocketManager:
    def __init__(self) -> None:
        self.clients: list[WebSocket] = []
        self.roles: dict[int, str] = {}
        self.latest_payload: dict[str, Any] | None = None
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.clients.append(websocket)
            self.roles[id(websocket)] = "subscriber"

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            if websocket in self.clients:
                self.clients.remove(websocket)
            self.roles.pop(id(websocket), None)

    async def mark_producer(self, websocket: WebSocket) -> None:
        async with self._lock:
            self.roles[id(websocket)] = "producer"

    async def get_latest(self) -> dict[str, Any] | None:
        async with self._lock:
            return self.latest_payload

    async def ingest(self, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = self._normalize_payload(payload)
        async with self._lock:
            self.latest_payload = normalized
        return normalized

    async def send_json(self, websocket: WebSocket, message: dict[str, Any]) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message: dict[str, Any]) -> None:
        async with self._lock:
            subscribers = [
                client
                for client in self.clients
                if self.roles.get(id(client), "subscriber") == "subscriber"
            ]

        if not subscribers:
            return

        results = await asyncio.gather(
            *(client.send_json(message) for client in subscribers),
            return_exceptions=True,
        )

        for client, result in zip(subscribers, results):
            if isinstance(result, Exception):
                LOGGER.warning("Dropping disconnected WebSocket client: %s", result)
                await self.disconnect(client)

    def _normalize_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = dict(payload)
        detections = normalized.get("detections", [])
        metadata = dict(normalized.get("metadata") or {})

        metadata.setdefault("stream_transport", "websocket")
        normalized["source"] = normalized.get("source", "ml-video-pipeline")
        normalized["timestamp"] = normalized.get("timestamp", time.time())
        normalized["detection_count"] = len(detections)
        normalized["detections"] = detections
        normalized["metadata"] = metadata
        normalized["frame"] = normalized.get("frame")
        return normalized


connection_manager = DetectionWebSocketManager()


@router.websocket("/ws/detect")
async def detection_stream(websocket: WebSocket) -> None:
    await connection_manager.connect(websocket)
    await connection_manager.send_json(
        websocket,
        {
            "type": "connection",
            "message": "Connected to RESCUE_DRONE detection stream",
        },
    )

    latest = await connection_manager.get_latest()
    if latest is not None:
        await connection_manager.send_json(
            websocket,
            {
                "type": "latest_detection",
                "payload": latest,
            },
        )

    try:
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break

            payload_text = message.get("text")
            if not payload_text:
                continue

            try:
                payload = json.loads(payload_text)
            except json.JSONDecodeError:
                await connection_manager.send_json(
                    websocket,
                    {
                        "type": "error",
                        "message": "Invalid JSON payload received on /ws/detect.",
                    },
                )
                continue

            if "detections" not in payload:
                continue

            await connection_manager.mark_producer(websocket)
            normalized = await connection_manager.ingest(payload)
            await connection_manager.broadcast(
                {
                    "type": "detection_update",
                    "payload": normalized,
                }
            )
    except WebSocketDisconnect:
        pass
    finally:
        await connection_manager.disconnect(websocket)

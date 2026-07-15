from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from websocket.manager import connection_manager

router = APIRouter(tags=["detection"])


class DetectionItem(BaseModel):
    label: str = "person"
    confidence: float = Field(..., ge=0.0, le=1.0)
    bbox: list[int] = Field(..., min_length=4, max_length=4)


class DetectionPayload(BaseModel):
    source: str = "ml-pipeline"
    timestamp: float | None = None
    detection_count: int | None = None
    frame: str | None = None
    detections: list[DetectionItem]
    metadata: dict[str, Any] = Field(default_factory=dict)


@router.post("/detect")
async def detect(payload: DetectionPayload) -> dict[str, Any]:
    normalized_payload = await connection_manager.ingest(payload.model_dump())

    await connection_manager.broadcast(
        {
            "type": "detection_update",
            "payload": normalized_payload,
        }
    )

    return {
        "status": "accepted",
        "latest_detections": normalized_payload,
    }


@router.get("/detect/latest")
async def latest_detection() -> dict[str, Any]:
    latest = await connection_manager.get_latest()
    return {
        "status": "ok",
        "latest_detections": latest,
    }

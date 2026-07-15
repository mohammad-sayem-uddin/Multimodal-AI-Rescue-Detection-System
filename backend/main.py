from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.detection import router as detection_router
from routes.health import router as health_router
from websocket.manager import router as websocket_router


app = FastAPI(
    title="RESCUE_DRONE API",
    description="Backend for AI-based monitoring and real-time detection.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(detection_router)
app.include_router(websocket_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "RESCUE_DRONE backend is running"}

from utils.ml_bridge import get_detector


class DetectionService:
    def __init__(self) -> None:
        self.detector = get_detector()

    def detect(self, source: str) -> dict:
        result = self.detector.run(source)
        return {
            "source": source,
            "status": "processed",
            "result": result,
        }

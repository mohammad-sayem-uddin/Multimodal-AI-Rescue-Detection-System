import { useEffect, useRef } from "react";

const BOX_COLOR = "#34d399";

function DetectionOverlay({ detections, frameSize = { width: 1280, height: 720 } }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.font = "12px 'Space Grotesk', 'Segoe UI', sans-serif";

    detections.forEach((detection, i) => {
      const [x, y, width, height] = detection.bbox;
      const scaledX = (x / frameSize.width) * rect.width;
      const scaledY = (y / frameSize.height) * rect.height;
      const scaledWidth = (width / frameSize.width) * rect.width;
      const scaledHeight = (height / frameSize.height) * rect.height;
      const label = `${detection.label} ${(detection.confidence * 100).toFixed(1)}%`;

      // Animated pulse for first detection (target lock)
      const pulse = i === 0 ? Math.abs(Math.sin(Date.now() / 700)) * 0.5 + 0.5 : 0;
      context.save();
      context.strokeStyle = i === 0 ? `rgba(52,211,153,${0.7 + 0.3 * pulse})` : BOX_COLOR;
      context.lineWidth = i === 0 ? 3 + 2 * pulse : 2;
      context.shadowColor = i === 0 ? `rgba(52,211,153,${0.25 + 0.25 * pulse})` : "rgba(52, 211, 153, 0.18)";
      context.shadowBlur = i === 0 ? 18 + 10 * pulse : 12;
      context.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      context.restore();

      // Target corners
      if (i === 0) {
        context.save();
        context.strokeStyle = "#22d3ee";
        context.lineWidth = 2;
        // Top-left
        context.beginPath();
        context.moveTo(scaledX, scaledY + 18);
        context.lineTo(scaledX, scaledY);
        context.lineTo(scaledX + 18, scaledY);
        context.stroke();
        // Top-right
        context.beginPath();
        context.moveTo(scaledX + scaledWidth - 18, scaledY);
        context.lineTo(scaledX + scaledWidth, scaledY);
        context.lineTo(scaledX + scaledWidth, scaledY + 18);
        context.stroke();
        // Bottom-left
        context.beginPath();
        context.moveTo(scaledX, scaledY + scaledHeight - 18);
        context.lineTo(scaledX, scaledY + scaledHeight);
        context.lineTo(scaledX + 18, scaledY + scaledHeight);
        context.stroke();
        // Bottom-right
        context.beginPath();
        context.moveTo(scaledX + scaledWidth - 18, scaledY + scaledHeight);
        context.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
        context.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - 18);
        context.stroke();
        context.restore();
      }

      // Label
      const textWidth = Math.max(88, context.measureText(label).width + 16);
      const labelY = Math.max(18, scaledY - 10);
      context.save();
      context.shadowBlur = 0;
      context.fillStyle = "rgba(2, 6, 23, 0.86)";
      context.fillRect(scaledX, labelY - 16, textWidth, 20);
      context.strokeStyle = "rgba(52, 211, 153, 0.35)";
      context.strokeRect(scaledX, labelY - 16, textWidth, 20);
      context.fillStyle = BOX_COLOR;
      context.fillText(label, scaledX + 8, labelY - 2);
      context.restore();
    });
  }, [detections, frameSize]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full rounded-[28px]"
    />
  );
}

export default DetectionOverlay;

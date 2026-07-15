import { useEffect, useState } from "react";

import AlertPanel from "../components/AlertPanel";
import Navbar from "../components/Navbar";
import VideoStream from "../components/VideoStream";
import { connectToMonitor } from "../services/socket";
import AISystemBoot from "../components/AISystemBoot";

const initialState = {
  connectionStatus: "connecting",
  latestPayload: null,
  detections: [],
  alertHistory: [],
  frameSize: { width: 1280, height: 720 },
  frame: null,
};

function DashboardPage() {
  const [monitorState, setMonitorState] = useState(initialState);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const socket = connectToMonitor((message) => {
      setMonitorState((current) => reduceIncomingMessage(current, message));
    });
    return () => socket?.close();
  }, []);

  // Simulate AI boot sequence (short, non-blocking)
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const detectionCount = monitorState.detections.length;
  const activeAlert =
    detectionCount > 0 ? `${detectionCount} person detections active` : "No active alerts";

  return (
    <>
      {booting && <AISystemBoot onComplete={() => setBooting(false)} />}
      <main className={`min-h-screen px-4 py-4 md:px-8 md:py-6 transition-opacity duration-500 ${booting ? "opacity-40 pointer-events-none blur-sm" : "opacity-100"}`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
          <Navbar
            connectionStatus={monitorState.connectionStatus}
            detectionCount={detectionCount}
          />

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
            <VideoStream
              detections={monitorState.detections}
              connectionStatus={monitorState.connectionStatus}
              latestPayload={monitorState.latestPayload}
              frameSize={monitorState.frameSize}
              frame={monitorState.frame}
            />
            <AlertPanel
              connectionStatus={monitorState.connectionStatus}
              detectionCount={detectionCount}
              activeAlert={activeAlert}
              latestPayload={monitorState.latestPayload}
              alertHistory={monitorState.alertHistory}
            />
          </section>
        </div>
      </main>
    </>
  );
}

function reduceIncomingMessage(current, message) {
  if (message.type === "connection") {
    return {
      ...current,
      connectionStatus: "running",
      alertHistory: shouldAppendAlert(current.alertHistory, "Detection stream connected.")
        ? [
            buildAlert({
              level: "info",
              text: "Detection stream connected.",
            }),
            ...current.alertHistory,
          ].slice(0, 8)
        : current.alertHistory,
    };
  }

  if (message.type === "error") {
    return {
      ...current,
      connectionStatus: "offline",
      alertHistory: [
        buildAlert({
          level: "critical",
          text: message.message,
        }),
        ...current.alertHistory,
      ].slice(0, 8),
    };
  }

  if (message.type === "status") {
    return {
      ...current,
      connectionStatus: message.status ?? current.connectionStatus,
      alertHistory: shouldAppendAlert(current.alertHistory, message.message)
        ? [
            buildAlert({
              level: message.status === "reconnecting" ? "warning" : "info",
              text: message.message,
            }),
            ...current.alertHistory,
          ].slice(0, 8)
        : current.alertHistory,
    };
  }

  if (message.type === "latest_detection" || message.type === "detection_update") {
    const payload = message.payload ?? null;
    const detections = payload?.detections ?? [];
    const nextFrameSize = payload?.metadata?.frame_size ?? current.frameSize;
    const nextFrame = payload?.frame ?? current.frame;
    const nextAlertText =
      detections.length > 0
        ? `${detections.length} person detected in live stream`
        : "Stream update received with no active detections";

    return {
      ...current,
      connectionStatus: "running",
      latestPayload: payload,
      detections,
      frameSize: nextFrameSize,
      frame: nextFrame,
      alertHistory: shouldAppendAlert(current.alertHistory, nextAlertText)
        ? [
            buildAlert({
              level: detections.length > 0 ? "warning" : "info",
              text: nextAlertText,
            }),
            ...current.alertHistory,
          ].slice(0, 8)
        : current.alertHistory,
    };
  }

  return current;
}

function buildAlert({ level, text }) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    level,
    text,
    time: new Date().toLocaleTimeString(),
  };
}

function shouldAppendAlert(alertHistory, nextText) {
  return alertHistory[0]?.text !== nextText;
}

export default DashboardPage;

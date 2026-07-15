import React from "react";
import { useOperationalState } from "../context/OperationalStateContext";

const stateColors = {
  IDLE: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  MONITORING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  TRACKING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  ANALYZING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  ALERT: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  CRITICAL: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"
};

export default function AIStatusBar() {
  const { state, aiMessage, visionConfidence, systemStability } = useOperationalState();

  return (
    <div
      className={`fixed z-40 left-0 right-0 top-0 flex items-center justify-between px-6 py-2 text-xs font-semibold tracking-wide shadow transition-colors duration-700 ${stateColors[state]}`}
      style={{backdropFilter: "blur(8px)", minHeight: 38}}
    >
      <div className="flex items-center gap-4">
        <span className="uppercase tracking-widest">AI STATUS: {state}</span>
        <span className="hidden sm:inline-block">{aiMessage}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>AUDIO ANALYSIS: <span className="font-mono">{state === "IDLE" ? "OFF" : "ACTIVE"}</span></span>
        <span>VISION CONFIDENCE: <span className="font-mono">{visionConfidence}</span></span>
        <span>SYSTEM: <span className="font-mono">{systemStability}</span></span>
      </div>
    </div>
  );
}

import { AlertTriangle, Activity, Shield } from "lucide-react";
import { useOperationalState } from "../context/OperationalStateContext";

const STATUS_CONFIG = {
  NORMAL: {
    accent:
      "border-emerald-400/25 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200 dark:border-emerald-400/20",
    glow: "shadow-[0_16px_50px_rgba(16,185,129,0.12)] dark:shadow-[0_18px_54px_rgba(0,255,156,0.08)]",
    iconClass:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200 dark:border-emerald-400/20",
    text: "Audio conditions are stable with no elevated distress indicators.",
    Icon: Shield,
  },
  POSSIBLE: {
    accent:
      "border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-200 dark:border-amber-400/25",
    glow: "shadow-[0_16px_50px_rgba(245,158,11,0.12)] dark:shadow-[0_18px_54px_rgba(245,158,11,0.08)]",
    iconClass:
      "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-200 dark:border-amber-400/20",
    text: "Raised vocal energy detected. Monitoring for escalation.",
    Icon: Activity,
  },
  SCREAM: {
    accent:
      "border-rose-400/30 bg-rose-500/10 text-rose-700 dark:text-rose-200 dark:border-rose-400/25",
    glow:
      "shadow-[0_16px_50px_rgba(244,63,94,0.14)] dark:shadow-[0_18px_54px_rgba(248,113,113,0.1)] animate-[pulse_1.5s_ease-in-out_infinite]",
    iconClass:
      "border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-200 dark:border-rose-400/20",
    text: "Possible scream signature detected. Review the live scene immediately.",
    Icon: AlertTriangle,
  },
};

function AudioStatus({ confidence, isListening, status }) {
  const { state, setOperationalState } = useOperationalState();
  // Subtle state-based accent
  const stateAccent =
    state === "IDLE"
      ? "ring-0"
      : state === "MONITORING"
      ? "ring-2 ring-blue-300/40"
      : state === "TRACKING"
      ? "ring-2 ring-emerald-400/40"
      : state === "ANALYZING"
      ? "ring-2 ring-indigo-400/40 animate-pulse"
      : state === "ALERT"
      ? "ring-2 ring-amber-400/60 animate-pulse"
      : state === "CRITICAL"
      ? "ring-2 ring-rose-500/80 animate-pulse"
      : "";

  const { accent, glow, iconClass, text, Icon } = STATUS_CONFIG[status];
  const isScream = status === "SCREAM";

  return (
    <div
      className={[
        "relative transition-all duration-700",
        accent,
        glow,
        stateAccent,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-slate-500 transition-all duration-300 dark:text-slate-400">
            Detection Status
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{status}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
            {isListening ? text : "Listening is paused. Start the microphone simulation to begin confidence tracking."}
          </p>
        </div>
        <div
          className={[
            "inline-flex rounded-2xl border p-3 transition-all duration-300 ease-out",
            iconClass,
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatusMetric label="Confidence" value={confidence.toFixed(2)} tone={status} />
        <StatusMetric label="Stream State" value={isListening ? "LIVE" : "PAUSED"} tone={isListening ? "NORMAL" : "POSSIBLE"} />
      </div>

      {isScream ? (
        <div className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 transition-all duration-300 dark:text-rose-200">
          ⚠ Possible scream detected
        </div>
      ) : null}
    </div>
  );
}

function StatusMetric({ label, value, tone }) {
  const toneClass =
    tone === "SCREAM"
      ? "border-rose-400/20 bg-rose-500/10"
      : tone === "POSSIBLE"
        ? "border-amber-400/20 bg-amber-400/10"
        : "border-slate-200/70 bg-white/55 dark:border-white/10 dark:bg-black/20";

  return (
    <div className={["rounded-2xl border p-4 transition-all duration-300", toneClass].join(" ")}>
      <p className="text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">{value}</p>
    </div>
  );
}

export default AudioStatus;

import React, { useEffect, useRef, useState } from "react";

/* ─── Threat palette ────────────────────────────────────────────── */
const THREAT_STYLE = {
  HIGH: {
    border: "hud-border--critical",
    accentRgb: "244,63,94",
    label: "THREAT · HIGH",
    labelColor: "text-rose-400",
    scanColor: "via-rose-400/18",
    chipBg: "bg-rose-500/10 border-rose-400/35 text-rose-300",
  },
  MEDIUM: {
    border: "hud-border--warning",
    accentRgb: "251,191,36",
    label: "CAUTION · MEDIUM",
    labelColor: "text-amber-400",
    scanColor: "via-amber-400/18",
    chipBg: "bg-amber-500/10 border-amber-400/35 text-amber-300",
  },
  LOW: {
    border: "hud-border--track",
    accentRgb: "34,211,238",
    label: "TRACK MODE",
    labelColor: "text-cyan-400",
    scanColor: "via-cyan-400/14",
    chipBg: "bg-cyan-400/10 border-cyan-400/30 text-cyan-300",
  },
  NONE: {
    border: "hud-border--idle",
    accentRgb: "34,211,238",
    label: "MONITORING",
    labelColor: "text-cyan-400/70",
    scanColor: "via-cyan-400/10",
    chipBg: "bg-cyan-400/8 border-cyan-400/20 text-cyan-400/60",
  },
};

/* ─── Drone mode labels ─────────────────────────────────────────── */
function resolveMode(threat, personDetected, screamDetected, aiEnabled) {
  if (!aiEnabled) return { label: "SYSTEM PAUSED", color: "text-slate-400" };
  if (threat === "HIGH")   return { label: "AUTO TRACK · ALERT", color: "text-rose-400" };
  if (threat === "MEDIUM") return { label: "SCAN MODE · AUDIO", color: "text-amber-400" };
  if (personDetected)      return { label: "TARGET ACQUIRED", color: "text-emerald-400" };
  return { label: "SEARCH MODE · ACTIVE", color: "text-cyan-400/80" };
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function DroneHUD({
  personDetected   = false,
  screamDetected   = false,
  personConfidence = 0,
  threat           = "NONE",
  opState          = "IDLE",
  metrics          = {},
  aiEnabled        = true,
}) {
  const ts    = THREAT_STYLE[threat] ?? THREAT_STYLE.NONE;
  const mode  = resolveMode(threat, personDetected, screamDetected, aiEnabled);

  /* Tick counter drives the live clock/telemetry digits */
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  /* Simulated telemetry (cosmetic only) */
  const fps    = 29;
  const lat    = metrics.systemLatency ?? 64;
  const alt    = (42.8 + Math.sin(tick / 3.1) * 1.4).toFixed(1);
  const signal = tick % 6 < 5 ? "STABLE" : "SYNC…";
  const gps    = "23.8103 / 90.4125";
  const frame  = `${String(new Date().getHours()).padStart(2,"0")}:${String(new Date().getMinutes()).padStart(2,"0")}:${String(new Date().getSeconds()).padStart(2,"0")}`;

  /* Confidence colour band */
  const confBarColor =
    personConfidence > 0.80 ? "#34d399"
    : personConfidence > 0.50 ? "#fbbf24"
    : "#f87171";

  /* Track-box position: subtle drift when detected */
  const driftX = personDetected ? Math.sin(tick / 2.2) * 1.2 : 0;
  const driftY = personDetected ? Math.cos(tick / 2.8) * 0.9 : 0;

  return (
    <div
      className={`hud-viewport ${ts.border}`}
      style={{
        "--accent-rgb": ts.accentRgb,
      }}
    >
      {/* ── Background feed placeholder ── */}
      <div className="hud-feed-bg" />

      {/* ── Cinematic vignette ── */}
      <div className="hud-vignette" />

      {/* ── Ambient scan-line texture ── */}
      <div className="hud-scanlines" />

      {/* ── Slow horizontal sweep ── */}
      <div className={`hud-sweep bg-gradient-to-b from-transparent ${ts.scanColor} to-transparent`} />

      {/* ── Corner bracket decorations ── */}
      <div className="hud-corner hud-corner--tl" />
      <div className="hud-corner hud-corner--tr" />
      <div className="hud-corner hud-corner--bl" />
      <div className="hud-corner hud-corner--br" />

      {/* ── Crosshair / center pulse (idle) ── */}
      {!personDetected && (
        <div className="hud-crosshair">
          <span className="hud-crosshair__ring" />
          <span className="hud-crosshair__dot" />
        </div>
      )}

      {/* ════════════════════════════════════════
          TOP-LEFT: Mission identity + mode chip
      ════════════════════════════════════════ */}
      <div className="hud-tl">
        <div className="hud-mission-id">
          <span className="hud-mission-id__dot" />
          R-01 · AERIAL UNIT
        </div>
        <div className={`hud-mode-chip ${ts.chipBg}`}>
          {mode.label}
        </div>
      </div>

      {/* ════════════════════════════════════════
          TOP-RIGHT: Telemetry cluster
      ════════════════════════════════════════ */}
      <div className="hud-tr">
        <div className="hud-telem-row">
          <span className="hud-telem-key">FPS</span>
          <span className="hud-telem-val">{fps}</span>
        </div>
        <div className="hud-telem-row">
          <span className="hud-telem-key">LAT</span>
          <span className="hud-telem-val">{lat}ms</span>
        </div>
        <div className="hud-telem-row">
          <span className="hud-telem-key">ALT</span>
          <span className="hud-telem-val">{alt}m</span>
        </div>
        <div className="hud-telem-row">
          <span className="hud-telem-key">SIG</span>
          <span className={`hud-telem-val ${signal === "SYNC…" ? "text-amber-400" : ""}`}>{signal}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM-LEFT: GPS + timestamp
      ════════════════════════════════════════ */}
      <div className="hud-bl">
        <div className="hud-telem-row">
          <span className="hud-telem-key">GPS</span>
          <span className="hud-telem-val font-mono text-[9px]">{gps}</span>
        </div>
        <div className="hud-telem-row">
          <span className="hud-telem-key">UTC</span>
          <span className="hud-telem-val font-mono">{frame}</span>
        </div>
        <div className="hud-telem-row">
          <span className="hud-telem-key">MODE</span>
          <span className={`hud-telem-val ${ts.labelColor}`}>{ts.label}</span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM-RIGHT: AI state indicators
      ════════════════════════════════════════ */}
      <div className="hud-br">
        <HudIndicator label="VISION AI"   active={aiEnabled}      color="cyan" />
        <HudIndicator label="AUDIO LINK"  active={screamDetected || aiEnabled} color={screamDetected ? "amber" : "cyan"} pulse={screamDetected} />
        <HudIndicator label="TRACK ENG"   active={personDetected} color="emerald" />
        <HudIndicator label="ALERT SYS"   active={threat === "HIGH" || threat === "MEDIUM"} color={threat === "HIGH" ? "rose" : "amber"} pulse={threat === "HIGH"} />
      </div>

      {/* ════════════════════════════════════════
          TARGET TRACKING BOX
      ════════════════════════════════════════ */}
      <div
        className="hud-target-area"
        style={{
          opacity:   personDetected ? 1 : 0,
          transform: personDetected
            ? `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px))`
            : "translate(-50%, -50%) scale(0.88)",
          transition: personDetected
            ? "opacity 0.4s ease-out, transform 0.6s cubic-bezier(0.4,0,0.2,1)"
            : "opacity 0.3s ease-out, transform 0.3s ease-out",
        }}
      >
        {/* Corner brackets of bounding box */}
        <div className="hud-bbox">
          <span className="hud-bbox__corner hud-bbox__corner--tl" />
          <span className="hud-bbox__corner hud-bbox__corner--tr" />
          <span className="hud-bbox__corner hud-bbox__corner--bl" />
          <span className="hud-bbox__corner hud-bbox__corner--br" />

          {/* Inner reticle */}
          <span className="hud-bbox__reticle" />

          {/* Center vertical pulse line */}
          <span className="hud-bbox__scan" />
        </div>

        {/* Label above box */}
        <div className="hud-target-label">
          <span className="hud-target-label__dot" />
          PERSON DETECTED
        </div>

        {/* Confidence bar below box */}
        <div className="hud-conf-bar-wrap">
          <div
            className="hud-conf-bar"
            style={{
              width: `${Math.round(personConfidence * 100)}%`,
              background: confBarColor,
              boxShadow: `0 0 8px ${confBarColor}55`,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
          <span className="hud-conf-label">
            CONF {(personConfidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════
          CENTER FEED PLACEHOLDER (when no live stream)
      ════════════════════════════════════════ */}
      <div className="hud-placeholder">
        <div className="hud-placeholder__inner">
          <p className="hud-placeholder__eyebrow">
            {personDetected ? "TARGET IN FRAME" : "SCANNING ENVIRONMENT"}
          </p>
          <h3 className="hud-placeholder__title">
            {personDetected ? "Rescue Target Acquired" : "Awaiting Visual Input"}
          </h3>
          <p className="hud-placeholder__sub">
            {personDetected
              ? `AI vision lock confirmed — confidence ${(personConfidence * 100).toFixed(0)}%`
              : "Live feed connects when backend stream is active"}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════
          THREAT ESCALATION PULSE RING
          Only shown on HIGH threat
      ════════════════════════════════════════ */}
      {threat === "HIGH" && (
        <div className="hud-alert-ring" />
      )}
    </div>
  );
}

/* ─── Sub-component: status indicator row ───────────────────────── */
function HudIndicator({ label, active, color = "cyan", pulse = false }) {
  const dotColors = {
    cyan:    active ? "bg-cyan-400"    : "bg-slate-600",
    emerald: active ? "bg-emerald-400" : "bg-slate-600",
    amber:   active ? "bg-amber-400"   : "bg-slate-600",
    rose:    active ? "bg-rose-400"    : "bg-slate-600",
  };
  const textColors = {
    cyan:    active ? "text-cyan-300/80"    : "text-slate-500",
    emerald: active ? "text-emerald-300/80" : "text-slate-500",
    amber:   active ? "text-amber-300/80"   : "text-slate-500",
    rose:    active ? "text-rose-300/80"    : "text-slate-500",
  };

  return (
    <div className="hud-indicator">
      <span
        className={`hud-indicator__dot ${dotColors[color]} ${pulse ? "animate-hud-dot-pulse" : ""}`}
      />
      <span className={`hud-indicator__label ${textColors[color]}`}>{label}</span>
      <span className={`hud-indicator__state ${active ? textColors[color] : "text-slate-600"}`}>
        {active ? "ON" : "STBY"}
      </span>
    </div>
  );
}

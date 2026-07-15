import React, { useEffect, useRef, useState } from "react";

/* ── Subsystem activation sequence ─────────────────────────────── */
const SUBSYSTEMS = [
  { key: "ai",      label: "INITIALIZING AI CORE",       ms: 0   },
  { key: "vision",  label: "LOADING VISION MODULE",      ms: 420 },
  { key: "audio",   label: "AUDIO ANALYSIS READY",       ms: 780 },
  { key: "gps",     label: "GPS TELEMETRY ONLINE",       ms: 1100 },
  { key: "threat",  label: "THREAT ENGINE CALIBRATED",   ms: 1380 },
  { key: "mission", label: "MISSION CONTROL ACTIVE",     ms: 1620 },
];

const READY_CHIPS = [
  { key: "vision",   label: "VISION READY",        color: "cyan"    },
  { key: "audio",    label: "AUDIO LINK ONLINE",   color: "emerald" },
  { key: "track",    label: "TRACKING CALIBRATED", color: "violet"  },
  { key: "threat",   label: "THREAT ENGINE ACTIVE",color: "amber"   },
  { key: "mission",  label: "MISSION MONITORING",  color: "cyan"    },
];

const TOTAL_DURATION = 2200; // ms before SYSTEM READY appears

const chipColor = {
  cyan:    "border-cyan-400/40    bg-cyan-400/10    text-cyan-600    dark:text-cyan-300",
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
  violet:  "border-violet-400/40  bg-violet-400/10  text-violet-600  dark:text-violet-300",
  amber:   "border-amber-400/40   bg-amber-400/10   text-amber-600   dark:text-amber-300",
};

export default function AISystemBoot({ onComplete }) {
  const [activeCount, setActiveCount]   = useState(0);
  const [progress, setProgress]         = useState(0);
  const [showReady, setShowReady]       = useState(false);
  const [exiting, setExiting]           = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    /* Activate each subsystem label at its specified offset */
    SUBSYSTEMS.forEach((sys, i) => {
      const t = setTimeout(() => {
        setActiveCount(i + 1);
        setProgress(Math.round(((i + 1) / SUBSYSTEMS.length) * 100));
      }, sys.ms);
      timers.current.push(t);
    });

    /* Show SYSTEM READY badge */
    const readyTimer = setTimeout(() => setShowReady(true), TOTAL_DURATION);
    timers.current.push(readyTimer);

    /* Begin exit fade, then call onComplete */
    const exitTimer = setTimeout(() => {
      setExiting(true);
      const done = setTimeout(() => onComplete?.(), 480);
      timers.current.push(done);
    }, TOTAL_DURATION + 700);
    timers.current.push(exitTimer);

    return () => timers.current.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className="boot-overlay"
      style={{
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? "none" : "auto",
        transition: "opacity 0.48s cubic-bezier(0.4,0,0.2,1)",
      }}
      aria-live="polite"
      aria-label="System initializing"
    >
      {/* Ambient background orbs */}
      <div className="boot-orb boot-orb--cyan" />
      <div className="boot-orb boot-orb--violet" />

      {/* Central boot panel */}
      <div className="boot-panel">
        {/* Header: logo + mission ID */}
        <div className="boot-header">
          <div className="boot-drone-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <circle cx="20" cy="20" r="19" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="6"  fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" />
              {/* arms */}
              <line x1="20" y1="14" x2="20" y2="4"  stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="26" x2="20" y2="36" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="20" x2="4"  y2="20" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="26" y1="20" x2="36" y2="20" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" strokeLinecap="round" />
              {/* rotors */}
              <circle cx="20" cy="4"  r="3" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.45)" strokeWidth="1" />
              <circle cx="20" cy="36" r="3" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.45)" strokeWidth="1" />
              <circle cx="4"  cy="20" r="3" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.45)" strokeWidth="1" />
              <circle cx="36" cy="20" r="3" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.45)" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <p className="boot-mission-id">RESCUE-DRONE  ·  R-01</p>
            <p className="boot-subtitle">AI Operational System</p>
          </div>
        </div>

        {/* Divider */}
        <div className="boot-divider" />

        {/* Subsystem rows */}
        <div className="boot-subsystems">
          {SUBSYSTEMS.map((sys, i) => {
            const active  = i < activeCount;
            const current = i === activeCount - 1;
            return (
              <div
                key={sys.key}
                className={`boot-sys-row ${active ? "boot-sys-row--active" : ""}`}
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <span
                  className={`boot-sys-dot ${active ? "boot-sys-dot--active" : ""} ${current ? "boot-sys-dot--pulse" : ""}`}
                />
                <span className="boot-sys-label">{sys.label}</span>
                {active && (
                  <span className="boot-sys-ok">OK</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="boot-progress-track">
          <div
            className="boot-progress-fill"
            style={{ width: `${progress}%`, transition: "width 0.38s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </div>
        <div className="boot-progress-label">
          <span>BOOT SEQUENCE</span>
          <span className="font-mono">{progress}%</span>
        </div>

        {/* SYSTEM READY reveal */}
        <div
          className={`boot-ready-block ${showReady ? "boot-ready-block--visible" : ""}`}
        >
          <div className="boot-ready-inner">
            <span className="boot-ready-dot" />
            <span className="boot-ready-text">SYSTEM READY</span>
          </div>
          <p className="boot-ready-sub">MISSION MONITORING ACTIVE</p>

          {/* Subsystem chips */}
          <div className="boot-chips">
            {READY_CHIPS.map((chip, i) => (
              <span
                key={chip.key}
                className={`boot-chip ${chipColor[chip.color]}`}
                style={{
                  animationDelay: `${i * 90}ms`,
                  opacity: 0,
                  animation: showReady
                    ? `bootChipIn 0.32s ease-out ${i * 90}ms forwards`
                    : "none",
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

const SUBSYSTEMS = [
  { key: "vision",  label: "VISION READY",         color: "cyan"    },
  { key: "audio",   label: "AUDIO LINK ONLINE",    color: "emerald" },
  { key: "track",   label: "TRACKING CALIBRATED",  color: "violet"  },
  { key: "threat",  label: "THREAT ENGINE ACTIVE", color: "amber"   },
  { key: "mission", label: "MISSION MONITORING",   color: "cyan"    },
];

const colorMap = {
  cyan:    "border-cyan-400/35    bg-cyan-400/8     text-cyan-600    dark:text-cyan-300    dark:bg-cyan-400/12",
  emerald: "border-emerald-400/35 bg-emerald-400/8  text-emerald-600 dark:text-emerald-300 dark:bg-emerald-400/12",
  violet:  "border-violet-400/35  bg-violet-400/8   text-violet-600  dark:text-violet-300  dark:bg-violet-400/12",
  amber:   "border-amber-400/35   bg-amber-400/8    text-amber-600   dark:text-amber-300   dark:bg-amber-400/12",
};

const dotColor = {
  cyan:    "bg-cyan-400",
  emerald: "bg-emerald-400",
  violet:  "bg-violet-400",
  amber:   "bg-amber-400",
};

/**
 * SubsystemStatus
 * Compact row of operational activation chips displayed in the header area
 * after the boot sequence completes.
 * Chips animate in one-by-one to simulate staged activation.
 */
export default function SubsystemStatus({ visible = false }) {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!visible) {
      setActiveCount(0);
      return;
    }
    // Stagger chips in after boot overlay exits
    const timers = SUBSYSTEMS.map((_, i) =>
      setTimeout(() => setActiveCount((c) => Math.max(c, i + 1)), i * 120 + 80)
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="subsystem-strip"
      aria-label="Subsystem activation status"
      role="status"
    >
      {SUBSYSTEMS.map((sys, i) => {
        const active = i < activeCount;
        return (
          <span
            key={sys.key}
            className={`subsystem-chip ${colorMap[sys.color]}`}
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(4px)",
              transition: `opacity 0.28s ease-out ${i * 60}ms, transform 0.28s ease-out ${i * 60}ms`,
            }}
          >
            <span
              className={`subsystem-chip__dot ${dotColor[sys.color]}`}
            />
            {sys.label}
          </span>
        );
      })}
    </div>
  );
}

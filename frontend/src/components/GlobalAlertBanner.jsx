import { useEffect, useRef, useState } from "react";
import { useThreat } from "../context/ThreatContext";

/* ─── Per-state banner copy ──────────────────────────────────── */
const BANNER_CFG = {
  HIGH: {
    eyebrow:  "ALERT · MULTI-SIGNAL",
    title:    "Emergency Protocol Active",
    detail:   "Person detected + audio threat confirmed. AI coordinating rescue response.",
    cls:      "gab--critical",
    show:     true,
  },
  MEDIUM: {
    eyebrow:  "CAUTION · AUDIO THREAT",
    title:    "Scan Mode Elevated",
    detail:   "Audio anomaly confirmed. Expanding search pattern. Track engine on standby.",
    cls:      "gab--warning",
    show:     true,
  },
  LOW: {
    eyebrow:  null,
    title:    null,
    detail:   null,
    cls:      "",
    show:     false,   // LOW and NONE don't show the banner
  },
  NONE: {
    eyebrow:  null,
    title:    null,
    detail:   null,
    cls:      "",
    show:     false,
  },
};

/* Recovery overlay copy */
const RECOVERY_MSGS = {
  HIGH:   "THREAT STABILISED · DE-ESCALATION COMPLETE",
  MEDIUM: "AUDIO THREAT CLEARED · TRACKING NORMALISED",
  LOW:    "TRACK LOCK REGAINED · MONITORING RESUMED",
};

export default function GlobalAlertBanner() {
  const { threat, prevThreat, transitionAt, recovering } = useThreat();

  const cfg       = BANNER_CFG[threat]     ?? BANNER_CFG.NONE;
  const prevCfg   = BANNER_CFG[prevThreat] ?? BANNER_CFG.NONE;

  /* Visible if current state says show, OR if we just recovered from one that did */
  const [mounted, setMounted]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    /* Whenever transitionAt changes a new state just fired */
    if (cfg.show) {
      clearTimeout(hideTimer.current);
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else if (recovering && prevCfg.show) {
      /* Show briefly while recovery message displays */
      clearTimeout(hideTimer.current);
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setMounted(false), 500);
      }, 3800);
    } else {
      clearTimeout(hideTimer.current);
      setVisible(false);
      hideTimer.current = setTimeout(() => setMounted(false), 500);
    }
    return () => clearTimeout(hideTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionAt, recovering]);

  if (!mounted) return null;

  const isRecovery = recovering && !cfg.show;
  const recovMsg   = RECOVERY_MSGS[prevThreat];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`gab-shell ${cfg.cls} ${visible ? "gab--in" : "gab--out"}`}
    >
      {isRecovery ? (
        /* Recovery state */
        <div className="gab-recovery">
          <span className="gab-recovery__dot" />
          <span className="gab-recovery__msg">{recovMsg}</span>
        </div>
      ) : (
        /* Active alert */
        <div className="gab-inner">
          <div className="gab-left">
            <p className="gab-eyebrow">{cfg.eyebrow}</p>
            <p className="gab-title">{cfg.title}</p>
            <p className="gab-detail">{cfg.detail}</p>
          </div>
          <div className="gab-right">
            <AiPulse threat={threat} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Animated AI pulse indicator ───────────────────────────── */
function AiPulse({ threat }) {
  const msgs = {
    HIGH:   ["MULTI-SIGNAL ESCALATION", "TRACKING PRIORITY MAX", "RESCUE ROUTE COMPUTING", "EMERGENCY PROTOCOL ON"],
    MEDIUM: ["AUDIO THREAT DETECTED",   "SCAN MODE ACTIVE",      "PATTERN ANALYSIS ON",    "AWAITING VISUAL LOCK"],
    LOW:    ["TRACK MODE ACTIVE",        "CONFIDENCE STABLE",     "ROUTE TRACKING ON",      "MONITORING ELEVATED"],
    NONE:   ["SYSTEM NOMINAL"],
  };
  const [idx, setIdx] = useState(0);
  const msgList = msgs[threat] ?? msgs.NONE;

  useEffect(() => {
    setIdx(0);
    const id = setInterval(() => setIdx(i => (i + 1) % msgList.length), 2400);
    return () => clearInterval(id);
  }, [threat, msgList.length]);

  return (
    <div className="gab-ai-pulse">
      <span className="gab-ai-dot" />
      <span key={idx} className="gab-ai-msg">{msgList[idx]}</span>
    </div>
  );
}

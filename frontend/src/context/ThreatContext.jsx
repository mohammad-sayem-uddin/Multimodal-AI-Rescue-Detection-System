import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ─── Threat level numeric rank (for direction detection) ─── */
const RANK = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };

/* ─── Per-level atmosphere config ───────────────────────────── */
export const THREAT_CONFIG = {
  NONE: {
    label:       "MONITORING",
    color:       "cyan",
    accentRgb:   "34,211,238",
    borderAlpha: 0.14,
    orbScale:    1.0,
    aiMsg:       "All systems nominal · search pattern active",
    recoveryMsg: null,
  },
  LOW: {
    label:       "TRACK MODE",
    color:       "emerald",
    accentRgb:   "52,211,153",
    borderAlpha: 0.28,
    orbScale:    1.08,
    aiMsg:       "Target acquired · tracking stability high",
    recoveryMsg: "Track lock regained · monitoring resumed",
  },
  MEDIUM: {
    label:       "CAUTION",
    color:       "amber",
    accentRgb:   "251,191,36",
    borderAlpha: 0.38,
    orbScale:    1.16,
    aiMsg:       "Audio anomaly confirmed · scan mode active",
    recoveryMsg: "Audio threat stabilised · returning to monitoring",
  },
  HIGH: {
    label:       "ALERT",
    color:       "rose",
    accentRgb:   "244,63,94",
    borderAlpha: 0.50,
    orbScale:    1.26,
    aiMsg:       "Multi-signal escalation · emergency protocol active",
    recoveryMsg: "Threat stabilised · de-escalation in progress",
  },
};

/* ─── Context ────────────────────────────────────────────────── */
const ThreatContext = createContext(null);

export function ThreatProvider({ children }) {
  const [threat,    setThreat]    = useState("NONE");
  const [prevThreat, setPrev]     = useState("NONE");
  const [transitionAt, setTAt]    = useState(Date.now());
  const [recovering, setRecovering] = useState(false);
  const recoveryTimerRef = useRef(null);

  /* Expose a setter so RealTime can drive it */
  const updateThreat = useCallback((next) => {
    setThreat(prev => {
      if (prev === next) return prev;

      setPrev(prev);
      setTAt(Date.now());

      /* De-escalation window */
      const prevRank = RANK[prev] ?? 0;
      const nextRank = RANK[next] ?? 0;
      if (nextRank < prevRank) {
        setRecovering(true);
        clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = setTimeout(() => setRecovering(false), 4000);
      } else {
        setRecovering(false);
      }

      return next;
    });
  }, []);

  useEffect(() => () => clearTimeout(recoveryTimerRef.current), []);

  const cfg = THREAT_CONFIG[threat] ?? THREAT_CONFIG.NONE;

  return (
    <ThreatContext.Provider
      value={{ threat, prevThreat, transitionAt, recovering, cfg, updateThreat }}
    >
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreat() {
  const ctx = useContext(ThreatContext);
  if (!ctx) throw new Error("useThreat must be used inside <ThreatProvider>");
  return ctx;
}

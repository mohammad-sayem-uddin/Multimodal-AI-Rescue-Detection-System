import { useEffect, useMemo, useRef, useState } from "react";

/* ─── Event type registry ────────────────────────────────────── */
const TYPE_META = {
  detection: {
    label: "DETECTION",
    accent: "cyan",
    priority: "MEDIUM",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.7" />
        <line x1="8" y1="1" x2="8" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="1" y1="8" x2="3.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  scream: {
    label: "AUDIO",
    accent: "amber",
    priority: "HIGH",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
        <path d="M3 5.5 Q5 3 8 4 Q11 5 11 8 Q11 11 8 12 Q5 13 3 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 5 Q15 8 13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  alert: {
    label: "ALERT",
    accent: "rose",
    priority: "HIGH",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
        <path d="M8 2 L14 13 H2 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  system: {
    label: "SYSTEM",
    accent: "violet",
    priority: "LOW",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
        <rect x="2" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="5" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="11" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="6.5" x2="7" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="9" y1="6.5" x2="11" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  tracking: {
    label: "TRACKING",
    accent: "emerald",
    priority: "LOW",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
        <path d="M2 8 Q5 4 8 8 Q11 12 14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  geo: {
    label: "GEO",
    accent: "cyan",
    priority: "LOW",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
        <circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11 L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="7" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
};

/* Fallback for unknown types */
const FALLBACK_META = {
  label: "EVENT",
  accent: "slate",
  priority: "LOW",
  icon: (
    <svg viewBox="0 0 16 16" fill="none" className="tl-icon">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  ),
};

/* ─── Accent colour maps ─────────────────────────────────────── */
const ACCENT = {
  cyan:    { dot: "bg-cyan-400",    badge: "tl-badge--cyan",    row: "tl-row--cyan",    line: "bg-cyan-400/60"    },
  amber:   { dot: "bg-amber-400",   badge: "tl-badge--amber",   row: "tl-row--amber",   line: "bg-amber-400/60"   },
  rose:    { dot: "bg-rose-400",    badge: "tl-badge--rose",    row: "tl-row--rose",    line: "bg-rose-400/60"    },
  violet:  { dot: "bg-violet-400",  badge: "tl-badge--violet",  row: "tl-row--violet",  line: "bg-violet-400/60"  },
  emerald: { dot: "bg-emerald-400", badge: "tl-badge--emerald", row: "tl-row--emerald", line: "bg-emerald-400/60" },
  slate:   { dot: "bg-slate-400",   badge: "tl-badge--slate",   row: "tl-row--slate",   line: "bg-slate-400/40"   },
};

/* ─── Filter tabs ────────────────────────────────────────────── */
const FILTERS = ["ALL", "DETECTION", "AUDIO", "ALERT", "SYSTEM"];
const FILTER_MAP = { DETECTION: "detection", AUDIO: "scream", ALERT: "alert", SYSTEM: "system" };

/* ─── AI analysis messages cycling per event activity ───────── */
const AI_MSGS = [
  "TRACKING STABILITY · HIGH",
  "PATTERN CONTINUITY CONFIRMED",
  "THREAT ENVELOPE NOMINAL",
  "MISSION MEMORY SYNCED",
  "PREDICTIVE ENGINE ACTIVE",
  "SPATIAL CORRELATION STABLE",
];

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function EventTimeline({ events = [] }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch]             = useState("");
  const [aiMsgIdx, setAiMsgIdx]         = useState(0);
  const containerRef = useRef(null);

  /* Cycle AI analysis message */
  useEffect(() => {
    const id = setInterval(
      () => setAiMsgIdx(i => (i + 1) % AI_MSGS.length),
      3800,
    );
    return () => clearInterval(id);
  }, []);

  /* Auto-scroll to top when new events arrive */
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events.length]);

  /* Filtered + searched list */
  const filtered = useMemo(() => {
    const typeKey = FILTER_MAP[activeFilter];
    return events
      .filter(e => {
        if (activeFilter !== "ALL" && e.type !== typeKey) return false;
        if (search && !e.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .slice()       // don't mutate
      .reverse();    // newest first
  }, [events, activeFilter, search]);

  /* Session summary derived from full event list */
  const summary = useMemo(() => {
    const detections = events.filter(e => e.type === "detection").length;
    const audios     = events.filter(e => e.type === "scream").length;
    const alerts     = events.filter(e => e.type === "alert").length;
    const lastAlert  = [...events].reverse().find(e => e.type === "alert");
    return { detections, audios, alerts, lastAlert: lastAlert?.timestamp ?? "—" };
  }, [events]);

  return (
    <div className="tl-shell">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="tl-header">
        <div>
          <p className="tl-eyebrow">Operational Memory</p>
          <h2 className="tl-title">Mission Timeline</h2>
        </div>
        <div className="tl-count-chip">
          <span className="tl-count-dot" />
          {events.length} EVENTS
        </div>
      </div>

      {/* ── Session Summary ──────────────────────────────────── */}
      <div className="tl-summary">
        <SummaryItem label="DETECTIONS" value={summary.detections} accent="cyan"    />
        <SummaryItem label="AUDIO"      value={summary.audios}     accent="amber"   />
        <SummaryItem label="ALERTS"     value={summary.alerts}     accent="rose"    />
        <SummaryItem label="LAST ALERT" value={summary.lastAlert}  accent="violet"  />
      </div>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="tl-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            className={`tl-filter-btn ${activeFilter === f ? "tl-filter-btn--active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="tl-search-wrap">
        <svg viewBox="0 0 16 16" fill="none" className="tl-search-icon">
          <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="tl-search-input"
          placeholder="Search mission events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          spellCheck={false}
        />
        {search && (
          <button
            type="button"
            className="tl-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Event feed ───────────────────────────────────────── */}
      <div ref={containerRef} className="tl-feed" aria-live="polite" aria-label="Mission event feed">
        {filtered.length === 0 ? (
          <div className="tl-empty">
            <span className="tl-empty__label">NO EVENTS MATCH</span>
          </div>
        ) : (
          <div className="tl-list">
            {filtered.map((event, idx) => {
              const meta   = TYPE_META[event.type] ?? FALLBACK_META;
              const accent = ACCENT[meta.accent]   ?? ACCENT.slate;
              const isNew  = idx === 0;
              return (
                <TimelineRow
                  key={event.id}
                  event={event}
                  meta={meta}
                  accent={accent}
                  isNew={isNew}
                  isLast={idx === filtered.length - 1}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── AI Analysis ticker ───────────────────────────────── */}
      <div className="tl-ai-bar">
        <span className="tl-ai-label">AI MEMORY</span>
        <span className="tl-ai-dot" />
        <span key={aiMsgIdx} className="tl-ai-msg">
          {AI_MSGS[aiMsgIdx]}
        </span>
      </div>
    </div>
  );
}

/* ─── Timeline row ───────────────────────────────────────────── */
function TimelineRow({ event, meta, accent, isNew, isLast }) {
  return (
    <div className={`tl-row-wrap ${isNew ? "tl-row--new" : ""}`}>
      {/* Vertical connector line */}
      <div className="tl-connector">
        <div className={`tl-connector__line ${isLast ? "opacity-0" : accent.line}`} />
      </div>

      {/* Icon dot */}
      <div className="tl-dot-wrap">
        <div className={`tl-dot ${accent.dot} ${isNew ? "tl-dot--pulse" : ""}`} />
      </div>

      {/* Event card */}
      <article className={`tl-card ${accent.row}`}>
        <div className="tl-card-top">
          {/* Icon + type badge */}
          <div className="tl-card-left">
            <span className={`tl-type-icon ${accent.badge}`}>
              {meta.icon}
            </span>
            <span className={`tl-badge ${accent.badge}`}>
              {meta.label}
            </span>
          </div>

          {/* Timestamp */}
          <time className="tl-timestamp">{event.timestamp}</time>
        </div>

        {/* Message */}
        <p className="tl-message">{event.message}</p>
      </article>
    </div>
  );
}

/* ─── Session summary item ───────────────────────────────────── */
function SummaryItem({ label, value, accent }) {
  const colorMap = {
    cyan:   "tl-sum--cyan",
    amber:  "tl-sum--amber",
    rose:   "tl-sum--rose",
    violet: "tl-sum--violet",
  };
  return (
    <div className={`tl-sum-item ${colorMap[accent] ?? ""}`}>
      <p className="tl-sum-label">{label}</p>
      <p className="tl-sum-value">{value}</p>
    </div>
  );
}

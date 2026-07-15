import { useEffect, useRef, useState } from "react";

/* ─── Threat palette ─────────────────────────────────────────── */
const THREAT_PALETTE = {
  HIGH:   { rgb: "244,63,94",   label: "THREAT · HIGH",   markerColor: "#f87171", borderCls: "map-border--critical", statusCls: "map-status--critical" },
  MEDIUM: { rgb: "251,191,36",  label: "CAUTION · MED",   markerColor: "#fbbf24", borderCls: "map-border--warning",  statusCls: "map-status--warning"  },
  LOW:    { rgb: "34,211,238",  label: "TRACK · ACTIVE",  markerColor: "#34d399", borderCls: "map-border--track",    statusCls: "map-status--track"    },
  NONE:   { rgb: "34,211,238",  label: "SEARCH · ACTIVE", markerColor: "#22d3ee", borderCls: "map-border--idle",     statusCls: "map-status--idle"     },
};

/* ─── AI spatial analysis messages ──────────────────────────── */
const ANALYSIS_MSGS = {
  HIGH:   ["TARGET LOCK CONFIRMED", "TRACKING STABILITY · HIGH", "ALERT ROUTING ACTIVE", "RESCUE INTERCEPT CALCULATED"],
  MEDIUM: ["AUDIO ANOMALY LOCATED", "PREDICTIVE ROUTE ACTIVE", "SCAN PATTERN EXPANDING", "SIGNAL SOURCE TRIANGULATED"],
  LOW:    ["TARGET ACQUIRED", "TRACK MODE · STABLE", "MOVEMENT DELTA NOMINAL", "VISUAL LOCK CONFIRMED"],
  NONE:   ["SEARCH PATTERN ACTIVE", "SECTOR SWEEP IN PROGRESS", "ENVIRONMENT ANALYSIS", "AWAITING VISUAL CONTACT"],
};

/* ─── SVG viewport dimensions (fixed coordinate space) ──────── */
const W = 480;
const H = 260;

/* Project lat/lng → SVG coordinates centred on drone ───────── */
function toSVG(pos, dronePos) {
  const latOffset = (pos.lat - dronePos.lat) * 10000;
  const lngOffset = (pos.lng - dronePos.lng) * 10000;
  return {
    x: clamp(W / 2 + lngOffset * W * 0.028, W * 0.06, W * 0.94),
    y: clamp(H / 2 - latOffset * H * 0.028, H * 0.06, H * 0.94),
  };
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

/* ─── Main component ─────────────────────────────────────────── */
export default function MapPanel({ dronePosition, targetPosition, targetVisible, threat = "NONE" }) {
  const palette  = THREAT_PALETTE[threat] ?? THREAT_PALETTE.NONE;
  const msgs     = ANALYSIS_MSGS[threat]  ?? ANALYSIS_MSGS.NONE;

  /* Live simulated positions */
  const [simDrone,  setSimDrone]  = useState(dronePosition);
  const [simTarget, setSimTarget] = useState(targetPosition);
  const [path,      setPath]      = useState([dronePosition]);
  const [targetPath, setTargetPath] = useState([targetPosition]);

  /* Cycling analysis message */
  const [msgIdx, setMsgIdx] = useState(0);
  const msgRef = useRef(0);

  /* Altitude drift (cosmetic) */
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);

      setSimDrone(prev => {
        const next = {
          lat: prev.lat + (Math.random() - 0.5) * 0.00018,
          lng: prev.lng + (Math.random() - 0.5) * 0.00018,
        };
        setPath(p => [...p.slice(-28), next]);
        return next;
      });

      if (targetVisible) {
        setSimTarget(prev => {
          const next = {
            lat: prev.lat + (Math.random() - 0.5) * 0.00026,
            lng: prev.lng + (Math.random() - 0.5) * 0.00026,
          };
          setTargetPath(p => [...p.slice(-18), next]);
          return next;
        });
      }

      msgRef.current = (msgRef.current + 1) % msgs.length;
      setMsgIdx(msgRef.current);
    }, 1800);
    return () => clearInterval(id);
  }, [targetVisible, msgs.length]);

  /* Derived */
  const droneXY  = toSVG(simDrone,  simDrone);   // always centre
  const targetXY = toSVG(simTarget, simDrone);
  const altitude = (42.8 + Math.sin(tick / 3.1) * 1.4).toFixed(1);
  const signal   = tick % 7 < 6 ? "STABLE" : "SYNC…";
  const dist     = targetVisible
    ? (Math.sqrt(
        Math.pow((simTarget.lat - simDrone.lat) * 111000, 2) +
        Math.pow((simTarget.lng - simDrone.lng) * 111000 * Math.cos(simDrone.lat * Math.PI / 180), 2)
      )).toFixed(0)
    : "—";

  /* Path polyline strings */
  const dronePath   = path.map(p => { const s = toSVG(p, simDrone); return `${s.x},${s.y}`; }).join(" ");
  const tgtPath     = targetPath.map(p => { const s = toSVG(p, simDrone); return `${s.x},${s.y}`; }).join(" ");

  return (
    <div className={`map-panel-shell ${palette.borderCls}`} style={{ "--accent-rgb": palette.rgb }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="map-panel-header">
        <div>
          <p className="map-eyebrow">Geo-Intelligence</p>
          <h2 className="map-title">Rescue Coordination</h2>
        </div>
        <div className={`map-status-chip ${palette.statusCls}`}>
          <span className="map-status-dot" />
          {targetVisible ? palette.label : "SEARCH · ACTIVE"}
        </div>
      </div>

      {/* ── SVG Viewport ─────────────────────────────────────── */}
      <div className="map-viewport-wrap">
        <svg
          className="map-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          aria-label="Geo-tracking display"
        >
          {/* Background */}
          <rect width={W} height={H} fill="#070f1a" />

          {/* Radial ambient glow */}
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stopColor={`rgba(${palette.rgb},0.07)`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <rect width={W} height={H} fill="url(#mapGlow)" />

          {/* Grid lines */}
          {[...Array(9)].map((_, i) => (
            <line key={`h${i}`} x1={0} y1={H / 9 * (i + 1)} x2={W} y2={H / 9 * (i + 1)}
              stroke={`rgba(${palette.rgb},0.06)`} strokeWidth="1" />
          ))}
          {[...Array(15)].map((_, i) => (
            <line key={`v${i}`} x1={W / 15 * (i + 1)} y1={0} x2={W / 15 * (i + 1)} y2={H}
              stroke={`rgba(${palette.rgb},0.06)`} strokeWidth="1" />
          ))}

          {/* Outer guide circle (search radius) */}
          <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.38}
            fill="none" stroke={`rgba(${palette.rgb},0.10)`} strokeWidth="1"
            strokeDasharray="4 6" />
          <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.22}
            fill="none" stroke={`rgba(${palette.rgb},0.07)`} strokeWidth="1" />

          {/* Drone path trail */}
          {path.length > 1 && (
            <polyline
              points={dronePath}
              fill="none"
              stroke={`rgba(34,211,238,0.45)`}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
              style={{ filter: "drop-shadow(0 0 3px rgba(34,211,238,0.30))" }}
            />
          )}

          {/* Target path trail (only when visible) */}
          {targetVisible && targetPath.length > 1 && (
            <polyline
              points={tgtPath}
              fill="none"
              stroke={`rgba(${palette.rgb},0.35)`}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 3px rgba(${palette.rgb},0.25))` }}
            />
          )}

          {/* Drone-to-target connector line */}
          {targetVisible && (
            <line
              x1={droneXY.x} y1={droneXY.y}
              x2={targetXY.x} y2={targetXY.y}
              stroke={`rgba(${palette.rgb},0.22)`}
              strokeWidth="1"
              strokeDasharray="5 4"
            />
          )}

          {/* ── Target marker ──────────────────────────────── */}
          {targetVisible ? (
            <g transform={`translate(${targetXY.x},${targetXY.y})`}>
              {/* Pulse rings */}
              <circle r="20" fill="none" stroke={`rgba(${palette.rgb},0.18)`} strokeWidth="1">
                <animate attributeName="r"   values="14;28;14" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r="10" fill="none" stroke={`rgba(${palette.rgb},0.35)`} strokeWidth="1">
                <animate attributeName="r"   values="8;16;8" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle r="5" fill={palette.markerColor}
                style={{ filter: `drop-shadow(0 0 6px rgba(${palette.rgb},0.80))` }} />
              <circle r="2.5" fill="white" opacity="0.9" />
              {/* Label */}
              <rect x="8" y="-11" width="52" height="14" rx="7"
                fill={`rgba(${palette.rgb},0.12)`}
                stroke={`rgba(${palette.rgb},0.35)`} strokeWidth="0.8" />
              <text x="34" y="-1" textAnchor="middle"
                fontSize="7.5" fontFamily="monospace" fontWeight="700"
                fill={`rgba(${palette.rgb},0.95)`} letterSpacing="1.5">
                TARGET
              </text>
            </g>
          ) : (
            /* No-target search pulse at centre */
            <g transform={`translate(${W / 2},${H / 2})`} opacity="0.35">
              <circle r="24" fill="none" stroke="rgba(34,211,238,0.25)" strokeWidth="1">
                <animate attributeName="r" values="18;36;18" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="3.5s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* ── Drone marker (always at SVG centre since we offset the world) */}
          <g transform={`translate(${droneXY.x},${droneXY.y})`}>
            {/* Signal radius */}
            <circle r="36" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="1"
              strokeDasharray="3 5" />
            {/* Steady pulse */}
            <circle r="10" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1">
              <animate attributeName="r"       values="7;18;7"    dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.8s" repeatCount="indefinite" />
            </circle>
            {/* Core */}
            <circle r="6" fill="#22d3ee"
              style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.90))" }} />
            <circle r="3" fill="white" opacity="0.95" />
            {/* Drone icon cross */}
            <line x1="-9" y1="0" x2="-6" y2="0" stroke="rgba(34,211,238,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6"  y1="0" x2="9"  y2="0" stroke="rgba(34,211,238,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-9" x2="0" y2="-6" stroke="rgba(34,211,238,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="6"  x2="0" y2="9"  stroke="rgba(34,211,238,0.55)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Label */}
            <rect x="-26" y="9" width="52" height="14" rx="7"
              fill="rgba(34,211,238,0.10)"
              stroke="rgba(34,211,238,0.30)" strokeWidth="0.8" />
            <text x="0" y="19" textAnchor="middle"
              fontSize="7.5" fontFamily="monospace" fontWeight="700"
              fill="rgba(34,211,238,0.90)" letterSpacing="1.5">
              DRONE R-01
            </text>
          </g>

          {/* ── Corner HUD brackets ─────────────────────────── */}
          {/* TL */}
          <path d="M8,22 L8,8 L22,8" fill="none" stroke={`rgba(${palette.rgb},0.40)`} strokeWidth="1.5" strokeLinecap="round" />
          {/* TR */}
          <path d={`M${W-22},8 L${W-8},8 L${W-8},22`} fill="none" stroke={`rgba(${palette.rgb},0.40)`} strokeWidth="1.5" strokeLinecap="round" />
          {/* BL */}
          <path d={`M8,${H-22} L8,${H-8} L22,${H-8}`} fill="none" stroke={`rgba(${palette.rgb},0.40)`} strokeWidth="1.5" strokeLinecap="round" />
          {/* BR */}
          <path d={`M${W-22},${H-8} L${W-8},${H-8} L${W-8},${H-22}`} fill="none" stroke={`rgba(${palette.rgb},0.40)`} strokeWidth="1.5" strokeLinecap="round" />

          {/* ── Coordinate tick labels ──────────────────────── */}
          <text x="10" y={H - 6} fontSize="7" fontFamily="monospace" fill="rgba(100,116,139,0.55)" letterSpacing="0.5">
            {simDrone.lat.toFixed(4)}N
          </text>
          <text x={W - 10} y={H - 6} textAnchor="end" fontSize="7" fontFamily="monospace" fill="rgba(100,116,139,0.55)" letterSpacing="0.5">
            {simDrone.lng.toFixed(4)}E
          </text>

          {/* ── Top-right: scan frame counter ──────────────── */}
          <text x={W - 10} y="16" textAnchor="end" fontSize="7" fontFamily="monospace" fill={`rgba(${palette.rgb},0.45)`} letterSpacing="0.8">
            FRAME {String(tick % 9999).padStart(4, "0")}
          </text>
        </svg>

        {/* Vignette overlay */}
        <div className="map-vignette" />
      </div>

      {/* ── Telemetry strip ───────────────────────────────────── */}
      <div className="map-telem-strip">
        <TelemetryItem label="DRONE"   value={`${simDrone.lat.toFixed(4)}, ${simDrone.lng.toFixed(4)}`} accent="cyan" />
        <TelemetryItem
          label="TARGET"
          value={targetVisible ? `${simTarget.lat.toFixed(4)}, ${simTarget.lng.toFixed(4)}` : "NO LOCK"}
          accent={threat === "HIGH" ? "rose" : threat === "MEDIUM" ? "amber" : targetVisible ? "emerald" : "slate"}
        />
        <TelemetryItem label="ALTITUDE" value={`${altitude}m`}           accent="cyan" />
        <TelemetryItem label="DISTANCE" value={targetVisible ? `${dist}m` : "—"} accent="violet" />
        <TelemetryItem label="SIGNAL"   value={signal}                   accent={signal === "STABLE" ? "emerald" : "amber"} />
      </div>

      {/* ── AI Spatial Analysis bar ───────────────────────────── */}
      <div className={`map-analysis-bar ${palette.statusCls}`}>
        <span className="map-analysis-label">AI SPATIAL</span>
        <span className="map-analysis-dot" />
        <span className="map-analysis-msg">{msgs[msgIdx]}</span>
        <span className="map-analysis-right">
          RADIUS · {Math.min(W, H) * 0.38 * 0.28 | 0}m
        </span>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function TelemetryItem({ label, value, accent = "cyan" }) {
  const colorMap = {
    cyan:    "border-cyan-400/20    bg-cyan-400/7    text-cyan-600    dark:text-cyan-300",
    emerald: "border-emerald-400/20 bg-emerald-400/7 text-emerald-600 dark:text-emerald-300",
    rose:    "border-rose-400/20    bg-rose-500/7    text-rose-600    dark:text-rose-300",
    amber:   "border-amber-400/20   bg-amber-400/7   text-amber-600   dark:text-amber-300",
    violet:  "border-violet-400/20  bg-violet-400/7  text-violet-600  dark:text-violet-300",
    slate:   "border-slate-300/30   bg-white/40      text-slate-500   dark:border-white/10 dark:bg-black/20 dark:text-slate-400",
  };
  return (
    <div className={`map-telem-item ${colorMap[accent]}`}>
      <p className="map-telem-item__label">{label}</p>
      <p className="map-telem-item__value">{value}</p>
    </div>
  );
}

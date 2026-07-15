import { Camera, Cpu, MapPinned, Mic } from "lucide-react";

const STATUS_ICON_MAP = {
  Camera,
  Audio: Mic,
  Model: Cpu,
  GPS: MapPinned,
};

const STATUS_TONE_MAP = {
  ok: {
    dot: "bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)]",
    badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
    icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200",
    glow: "shadow-[0_18px_44px_rgba(16,185,129,0.08)] dark:shadow-[0_18px_44px_rgba(0,255,156,0.06)]",
  },
  warning: {
    dot: "bg-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.7)]",
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200",
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-200",
    glow: "shadow-[0_18px_44px_rgba(245,158,11,0.08)] dark:shadow-[0_18px_44px_rgba(245,158,11,0.06)]",
  },
  error: {
    dot: "bg-rose-400 shadow-[0_0_18px_rgba(248,113,113,0.7)]",
    badge: "border-rose-400/20 bg-rose-500/10 text-rose-700 dark:text-rose-200",
    icon: "border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-200",
    glow: "shadow-[0_18px_44px_rgba(248,113,113,0.08)] dark:shadow-[0_18px_44px_rgba(248,113,113,0.06)]",
  },
};

function SystemStatus({ statuses, compact = false }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
        System Status
      </p>
      <div className={["mt-5", compact ? "space-y-2.5" : "space-y-3"].join(" ")}>
        {statuses.map((status) => (
          <StatusRow key={status.label} {...status} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function StatusRow({ label, value, tone, compact = false }) {
  const Icon = STATUS_ICON_MAP[label];
  const styles = STATUS_TONE_MAP[tone];

  return (
    <div
      className={[
        "flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/55 transition-all duration-300 dark:border-white/10 dark:bg-black/20",
        compact ? "p-3" : "p-4",
        styles.glow,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className={["inline-flex rounded-2xl border transition-all duration-300", compact ? "p-2.5" : "p-3", styles.icon].join(" ")}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 transition-all duration-300 dark:text-white">
            {label}
          </p>
          <p className="mt-1 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">
            {value}
          </p>
        </div>
      </div>
      <span className={["h-3 w-3 rounded-full", styles.dot].join(" ")} />
    </div>
  );
}

export default SystemStatus;

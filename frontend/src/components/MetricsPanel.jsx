import { Activity, Gauge, ShieldAlert, Timer, UserRoundCheck } from "lucide-react";

function MetricsPanel({ metrics, aiEnabled, compact = false }) {
  const items = [
    {
      key: "personsDetectedTotal",
      title: "Persons Detected",
      value: String(metrics.personsDetectedTotal).padStart(2, "0"),
      icon: UserRoundCheck,
      accent: "cyan",
    },
    {
      key: "averageConfidence",
      title: "Average Confidence",
      value: metrics.averageConfidence.toFixed(2),
      icon: Activity,
      accent: metrics.averageConfidence >= 0.7 ? "emerald" : metrics.averageConfidence >= 0.5 ? "amber" : "cyan",
    },
    {
      key: "alertsTriggered",
      title: "Alerts Triggered",
      value: String(metrics.alertsTriggered).padStart(2, "0"),
      icon: ShieldAlert,
      accent: metrics.alertsTriggered > 0 ? "rose" : "emerald",
    },
    {
      key: "detectionRate",
      title: "Detection Rate",
      value: `${metrics.detectionRate} / min`,
      icon: Gauge,
      accent: metrics.detectionRate >= 18 ? "amber" : "cyan",
    },
    {
      key: "systemLatency",
      title: "System Latency",
      value: `${metrics.systemLatency} ms`,
      icon: Timer,
      accent: metrics.systemLatency >= 95 ? "amber" : "emerald",
    },
  ];

  return (
    <div
      className={[
        "rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]",
        !aiEnabled ? "opacity-65" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
            System Metrics
          </p>
          <h2 className={["mt-3 font-semibold text-slate-900 transition-all duration-300 dark:text-white", compact ? "text-xl" : "text-2xl"].join(" ")}>
            Live analytics
          </h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-700 transition-all duration-300 dark:text-cyan-200">
          {aiEnabled ? "Tracking" : "Frozen"}
        </div>
      </div>

      <div className={["mt-6 grid gap-4", compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"].join(" ")}>
        {items.map((item) => (
          <MetricTile key={item.key} {...item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function MetricTile({ title, value, icon: Icon, accent, compact = false }) {
  const accentClass =
    accent === "rose"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-200"
      : accent === "amber"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-200"
        : accent === "emerald"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200";

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 ease-out dark:border-white/10 dark:bg-black/20">
      <div className={["inline-flex rounded-2xl border p-3 transition-all duration-300", accentClass].join(" ")}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{title}</p>
      <p className={["mt-2 font-semibold tracking-tight text-slate-900 transition-all duration-300 dark:text-white", compact ? "text-2xl" : "text-3xl"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

export default MetricsPanel;

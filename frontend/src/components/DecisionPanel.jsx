import { BrainCircuit, ShieldAlert, ShieldCheck, Siren } from "lucide-react";

const THREAT_STYLES = {
  NONE: {
    card: "border-slate-200/70 bg-white/60 shadow-[0_22px_70px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]",
    badge: "border-slate-300/70 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-200",
    icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200",
    Icon: ShieldCheck,
  },
  LOW: {
    card: "border-emerald-400/20 bg-white/60 shadow-[0_22px_70px_rgba(16,185,129,0.08)] dark:border-emerald-400/15 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,255,156,0.08)]",
    badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
    icon: "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200",
    Icon: BrainCircuit,
  },
  MEDIUM: {
    card: "border-amber-400/20 bg-white/60 shadow-[0_22px_70px_rgba(245,158,11,0.08)] dark:border-amber-400/15 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(245,158,11,0.08)]",
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200",
    icon: "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-200",
    Icon: Siren,
  },
  HIGH: {
    card: "audio-alert-active border-rose-400/25 bg-white/60 shadow-[0_22px_70px_rgba(244,63,94,0.12)] dark:border-rose-400/20 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(248,113,113,0.1)]",
    badge: "border-rose-400/20 bg-rose-500/10 text-rose-700 dark:text-rose-200",
    icon: "border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-200",
    Icon: ShieldAlert,
  },
};

function DecisionPanel({ decision, threat, reason, personDetected, screamDetected }) {
  const styles = THREAT_STYLES[threat];
  const Icon = styles.Icon;

  return (
    <div
      className={[
        "rounded-[28px] border p-5 backdrop-blur-2xl transition-all duration-300 ease-out hover:scale-[1.015]",
        styles.card,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
            AI Decision
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 transition-all duration-300 dark:text-white">
            {decision}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
            {reason}
          </p>
        </div>
        <div className={["inline-flex rounded-2xl border p-3 transition-all duration-300", styles.icon].join(" ")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <DecisionMetric label="Threat Level" value={threat} badgeClass={styles.badge} />
        <DecisionMetric
          label="Vision Input"
          value={personDetected ? "PERSON" : "CLEAR"}
          badgeClass={
            personDetected
              ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200"
              : "border-slate-300/70 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-200"
          }
        />
        <DecisionMetric
          label="Audio Input"
          value={screamDetected ? "SCREAM" : "NORMAL"}
          badgeClass={
            screamDetected
              ? "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200"
              : "border-slate-300/70 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-200"
          }
        />
      </div>
    </div>
  );
}

function DecisionMetric({ label, value, badgeClass }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20">
      <p className="text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{label}</p>
      <div className={["mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.28em] transition-all duration-300", badgeClass].join(" ")}>
        {value}
      </div>
    </div>
  );
}

export default DecisionPanel;

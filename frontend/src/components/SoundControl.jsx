import { BellRing, Volume2, VolumeX } from "lucide-react";

function SoundControl({ soundEnabled, onToggle, alertMode, compact = false }) {
  const modeClass =
    alertMode === "REPEATING ALERT"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-700 dark:text-rose-200"
      : alertMode === "SHORT BEEP"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200"
        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200";

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(124,58,237,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-violet-600/80 transition-all duration-300 dark:text-violet-300/75">
        Sound Alert
      </p>
      <div className={["mt-5", compact ? "space-y-4" : "flex items-start justify-between gap-4"].join(" ")}>
        <div>
          <h3 className={["font-semibold text-slate-900 transition-all duration-300 dark:text-white", compact ? "text-lg" : "text-xl"].join(" ")}>
            {soundEnabled ? "Sound ON" : "Sound OFF"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
            {compact
              ? "Medium threats beep once. High alerts repeat with cooldown protection."
              : "Medium threats issue a short beep. High alerts escalate to a repeating alarm pattern with cooldown protection."}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="neon-button inline-flex items-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-700 transition-all duration-300 ease-out hover:scale-[1.03] hover:border-violet-300/45 hover:bg-violet-400/15 active:scale-[0.98] dark:text-violet-100"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {soundEnabled ? "Mute" : "Enable"}
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20">
          <p className="text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">
            Alert Mode
          </p>
          <div className={["mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.28em] transition-all duration-300", modeClass].join(" ")}>
            <BellRing className="mr-2 h-3.5 w-3.5" />
            {alertMode}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoundControl;

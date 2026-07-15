import GlassSkeleton from "./GlassSkeleton";

function ControlPanel({
  aiEnabled,
  onToggleAi,
  sensitivity,
  onSensitivityChange,
  threshold,
  onThresholdChange,
  loading,
}) {
  if (loading) {
    return (
      <div className="card-panel">
        <div className="mb-4 h-4 w-32 skeleton" />
        <GlassSkeleton height={56} className="w-full mb-4" />
        <GlassSkeleton height={56} className="w-full mb-4" />
        <GlassSkeleton height={56} className="w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
        System Control
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20">
        <div>
          <p className="text-sm font-medium text-slate-900 transition-all duration-300 dark:text-white">
            AI System
          </p>
          <p className="mt-1 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">
            {aiEnabled ? "System is actively analyzing live inputs" : "System Paused"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAi}
          aria-pressed={aiEnabled}
          className={[
            "relative inline-flex h-11 w-24 items-center rounded-full border transition-all duration-300 ease-out",
            aiEnabled
              ? "border-cyan-400/30 bg-cyan-400/18 shadow-[0_0_24px_rgba(0,245,255,0.14)]"
              : "border-slate-300/80 bg-slate-200/75 dark:border-white/10 dark:bg-white/10",
          ].join(" ")}
        >
          <span
            className={[
              "absolute left-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-800 shadow-md transition-all duration-300 dark:bg-slate-950 dark:text-slate-200",
              aiEnabled ? "translate-x-14" : "translate-x-0",
            ].join(" ")}
          >
            {aiEnabled ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <SliderBlock
          label="Detection Sensitivity"
          value={`${sensitivity}%`}
          min={0}
          max={100}
          step={1}
          sliderValue={sensitivity}
          onChange={onSensitivityChange}
          accent="cyan"
        />
        <SliderBlock
          label="Alert Threshold"
          value={threshold.toFixed(2)}
          min={0.1}
          max={0.9}
          step={0.01}
          sliderValue={threshold}
          onChange={onThresholdChange}
          accent="violet"
        />
      </div>
    </div>
  );
}

function SliderBlock({
  label,
  value,
  min,
  max,
  step,
  sliderValue,
  onChange,
  accent = "cyan",
  disabled = false,
}) {
  const accentTrack =
    accent === "violet"
      ? "accent-violet-500 dark:accent-violet-400"
      : "accent-cyan-500 dark:accent-cyan-400";

  return (
    <div
      className={[
        "rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-900 transition-all duration-300 dark:text-white">
          {label}
        </p>
        <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-600 transition-all duration-300 dark:border-white/10 dark:bg-black/25 dark:text-slate-300">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className={[
          "mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200/90 transition-all duration-300 dark:bg-white/10",
          accentTrack,
          disabled ? "cursor-not-allowed" : "",
        ].join(" ")}
      />
    </div>
  );
}

export default ControlPanel;

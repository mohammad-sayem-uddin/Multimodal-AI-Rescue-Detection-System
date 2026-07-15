import { Activity, LoaderCircle, ShieldAlert, Target } from "lucide-react";

function ResultPanel({ detectionResult, isAnalyzing, file }) {
  const primaryObject = detectionResult?.objects?.[0];
  const status = resolveStatus(primaryObject?.confidence);

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(124,58,237,0.08)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-violet-600/80 transition-all duration-300 dark:text-violet-300/75">
        Detection Results
      </p>

      <div className="mt-4 space-y-4">
        <ResultTile
          icon={Target}
          label="Total Objects"
          value={detectionResult ? String(detectionResult.objects.length) : "--"}
        />
        <ResultTile
          icon={Activity}
          label="Primary Label"
          value={primaryObject?.label ?? "Waiting"}
        />
        <ResultTile
          icon={ShieldAlert}
          label="Confidence"
          value={primaryObject ? `${Math.round(primaryObject.confidence * 100)}%` : "--"}
        />
      </div>

      <div className="mt-5 rounded-[24px] border border-cyan-400/20 bg-cyan-400/8 p-4 transition-all duration-300">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-700 transition-all duration-300 dark:text-cyan-300/80">
          Status
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${status.dotClass}`} />
          <span className="text-lg font-semibold text-slate-900 transition-all duration-300 dark:text-white">
            {isAnalyzing ? "Analyzing..." : status.label}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
          {isAnalyzing
            ? "Running simulated AI inspection on the uploaded media."
            : detectionResult
              ? "Mock result generated successfully. Interface is ready for real inference integration."
              : file
                ? "Upload complete. Run detection to simulate object recognition."
                : "Awaiting media upload."}
        </p>
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20">
        {isAnalyzing ? (
          <div className="flex items-center gap-3 text-sm text-slate-700 transition-all duration-300 dark:text-slate-200">
            <LoaderCircle className="h-5 w-5 animate-spin text-cyan-500 dark:text-cyan-300" />
            <span>Analyzing...</span>
          </div>
        ) : (
          <ul className="space-y-3 text-sm">
            {(detectionResult?.objects ?? []).length > 0 ? (
              detectionResult.objects.map((item, index) => (
                <li
                  key={`${item.label}-${index}`}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-900 transition-all duration-300 dark:text-white">
                      {item.label}
                    </span>
                    <span className="text-cyan-700 transition-all duration-300 dark:text-cyan-300">
                      {item.confidence.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-dashed border-slate-200/70 bg-white/70 px-4 py-5 text-slate-600 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                Detection results will appear here after the mock analysis runs.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function ResultTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 ease-out hover:scale-[1.01] dark:border-white/10 dark:bg-black/20">
      <div className="inline-flex rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-600 transition-all duration-300 dark:text-violet-200">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">{value}</p>
    </div>
  );
}

function resolveStatus(confidence) {
  if (typeof confidence !== "number") {
    return {
      label: "Standby",
      dotClass: "bg-slate-400",
    };
  }

  if (confidence < 0.5) {
    return {
      label: "LOW",
      dotClass: "bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]",
    };
  }

  if (confidence < 0.75) {
    return {
      label: "MEDIUM",
      dotClass: "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.6)]",
    };
  }

  return {
    label: "HIGH",
    dotClass: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]",
  };
}

export default ResultPanel;

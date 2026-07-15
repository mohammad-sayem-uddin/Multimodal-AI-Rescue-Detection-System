import GlassSkeleton from "./GlassSkeleton";

function SnapshotPanel({ snapshot, loading }) {
  const hasSnapshot = Boolean(snapshot);

  if (loading) {
    return (
      <div className="card-panel">
        <div className="mb-4 h-4 w-32 skeleton" />
        <GlassSkeleton height={224} className="w-full mb-4" />
        <div className="grid gap-3 sm:grid-cols-3">
          <GlassSkeleton height={48} />
          <GlassSkeleton height={48} />
          <GlassSkeleton height={48} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-[28px] border bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]",
        hasSnapshot
          ? "border-rose-400/20 shadow-[0_22px_70px_rgba(244,63,94,0.1)] dark:shadow-[0_22px_70px_rgba(248,113,113,0.08)]"
          : "border-slate-200/70 dark:border-white/10",
      ].join(" ")}
    >
      <p className="text-[11px] uppercase tracking-[0.34em] text-rose-600/80 transition-all duration-300 dark:text-rose-300/75">
        Last Alert Snapshot
      </p>

      <div className="mt-5">
        {hasSnapshot ? (
          <div className="animate-[snapshotReveal_420ms_ease-out]">
            <div className="overflow-hidden rounded-[24px] border border-rose-400/20 bg-slate-950/30">
              <img
                src={snapshot.image}
                alt={`${snapshot.label} snapshot`}
                className="h-56 w-full object-cover"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <SnapshotMeta label="Time" value={snapshot.timestamp} />
              <SnapshotMeta label="Detected" value={snapshot.label} />
              <SnapshotMeta label="Confidence" value={snapshot.confidence.toFixed(2)} />
            </div>
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded-[24px] border border-dashed border-slate-300/80 bg-white/45 text-center transition-all duration-300 dark:border-white/10 dark:bg-black/20">
            <div>
              <p className="text-lg font-medium text-slate-800 transition-all duration-300 dark:text-white">
                No alerts captured
              </p>
              <p className="mt-2 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">
                Snapshot evidence will appear here when the decision engine captures a high-priority event.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SnapshotMeta({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20">
      <p className="text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900 transition-all duration-300 dark:text-white">{value}</p>
    </div>
  );
}

export default SnapshotPanel;

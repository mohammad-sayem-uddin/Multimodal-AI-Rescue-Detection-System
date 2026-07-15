function AlertPanel({
  connectionStatus,
  detectionCount,
  activeAlert,
  latestPayload,
  alertHistory,
}) {
  const latestTime = latestPayload?.timestamp
    ? new Date(latestPayload.timestamp * 1000).toLocaleTimeString()
    : "Awaiting signal";

  return (
    <aside className="flex flex-col gap-5">
      <section className="rounded-[32px] border border-rose-400/10 bg-slate-950/70 p-5 shadow-[0_30px_90px_rgba(2,8,23,0.55)] backdrop-blur-xl">
        <p className="text-[11px] uppercase tracking-[0.45em] text-rose-200/80">
          Active Alerts
        </p>
        <div className="mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.95),rgba(15,23,42,0.95))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Person Detection</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{activeAlert}</p>
            </div>
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.28em] text-rose-200/70">
                Targets
              </p>
              <p className="mt-1 text-3xl font-semibold text-white">{detectionCount}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="System" value={connectionStatus} />
            <Metric label="Last Event" value={latestTime} />
            <Metric label="Feed Source" value={latestPayload?.source ?? "realtime"} />
            <Metric
              label="Detection Mode"
              value={detectionCount > 0 ? "Escalated" : "Monitoring"}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-cyan-400/10 bg-slate-950/70 p-5 shadow-[0_30px_90px_rgba(2,8,23,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">
              Event Log
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">Realtime Signals</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
            {alertHistory.length} entries
          </span>
        </div>

        <div className="mt-4 flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
          {alertHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-slate-400">
              Waiting for detections from the monitoring stream.
            </div>
          ) : (
            alertHistory.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${levelTone(alert.level)}`} />
                    <p className="text-sm font-medium text-slate-100">{alert.text}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    {alert.time}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-slate-100">{value}</p>
    </div>
  );
}

function levelTone(level) {
  if (level === "critical") {
    return "bg-rose-400";
  }
  if (level === "warning") {
    return "bg-amber-300";
  }
  return "bg-cyan-300";
}

export default AlertPanel;

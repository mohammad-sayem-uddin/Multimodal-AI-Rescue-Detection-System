function Navbar({ connectionStatus, detectionCount }) {
  const statusTone =
    connectionStatus === "running"
      ? "bg-emerald-400"
      : connectionStatus === "connecting"
        ? "bg-amber-300"
        : "bg-rose-400";

  return (
    <header className="rounded-[28px] border border-cyan-400/10 bg-slate-950/70 px-5 py-4 shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">
            Autonomous Monitoring Interface
          </p>
          <div className="mt-2 flex items-end gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              RESCUE_DRONE
            </h1>
            <span className="mb-1 hidden text-sm text-slate-400 md:inline">
              Surveillance Command Dashboard
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              System Status
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${statusTone} shadow-[0_0_18px_currentColor]`} />
              <span className="text-sm font-medium capitalize text-slate-100">
                {connectionStatus}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Detection Count
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-semibold text-white">{detectionCount}</span>
              <span className="pb-1 text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                active targets
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

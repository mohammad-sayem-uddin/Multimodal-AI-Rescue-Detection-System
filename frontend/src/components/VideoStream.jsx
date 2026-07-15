import DetectionOverlay from "./DetectionOverlay";

function VideoStream({ detections, connectionStatus, latestPayload, frameSize, frame }) {
  const timestamp = latestPayload?.timestamp
    ? new Date(latestPayload.timestamp * 1000).toLocaleTimeString()
    : "Awaiting stream";

  return (
    <section className="rounded-[32px] border border-cyan-400/10 bg-slate-950/70 p-4 shadow-[0_30px_90px_rgba(2,8,23,0.55)] backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">
            Live Video Feed
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Aerial Observation Channel</h2>
        </div>

        <div className="flex gap-3">
          <SignalChip label="Stream" value={connectionStatus} />
          <SignalChip label="Last Update" value={timestamp} />
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-[28px] border border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(160deg,rgba(2,6,23,0.96),rgba(15,23,42,0.98))] shadow-[0_8px_40px_rgba(2,8,23,0.45)]">
        {frame ? (
          <img
            src={frame}
            alt="Live detection stream"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px] opacity-50" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.08)_55%,rgba(2,6,23,0.72)_100%)]" />
        <CameraHUD />

        <div className="absolute left-5 top-5 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
          Vision Active
        </div>

        <div className="absolute right-5 top-5 text-right">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Target Lock</p>
          <p className="mt-1 text-sm font-medium text-white">{detections.length} signatures</p>
        </div>

        {!frame ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-center backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                Live Feed
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Waiting for frames from the detector stream
              </p>
            </div>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <DetectionOverlay detections={detections} frameSize={frameSize} />

        <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-3">
          <TelemetryCard label="Mode" value="Real-time scan" />
          <TelemetryCard
            label="Inference"
            value={latestPayload?.metadata?.model_name ?? "YOLOv8s"}
          />
          <TelemetryCard
            label="Transport"
            value={latestPayload?.metadata?.stream_transport ?? latestPayload?.source ?? "websocket"}
          />
        </div>
      </div>
    </section>
  );
}

function SignalChip({ label, value }) {
  return (
    <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-slate-100">{value}</p>
    </div>
  );
}

function TelemetryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

// HUD overlays
function CameraHUD() {
  return (
    <>
      {/* Scanning corners */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Top-left */}
        <div className="absolute left-0 top-0 h-8 w-8 border-t-2 border-l-2 border-cyan-300/70 rounded-tl-2xl" />
        {/* Top-right */}
        <div className="absolute right-0 top-0 h-8 w-8 border-t-2 border-r-2 border-cyan-300/70 rounded-tr-2xl" />
        {/* Bottom-left */}
        <div className="absolute left-0 bottom-0 h-8 w-8 border-b-2 border-l-2 border-cyan-300/70 rounded-bl-2xl" />
        {/* Bottom-right */}
        <div className="absolute right-0 bottom-0 h-8 w-8 border-b-2 border-r-2 border-cyan-300/70 rounded-br-2xl" />
      </div>
      {/* Scan lines */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 w-full border-t border-cyan-200/20"
            style={{ top: `${(100 / 12) * i}%` }}
          />
        ))}
      </div>
      {/* Telemetry micro-labels */}
      <div className="pointer-events-none absolute z-20 text-[10px] font-mono uppercase tracking-widest text-cyan-200/80">
        <div className="absolute left-3 top-3 bg-slate-900/60 rounded px-2 py-1 border border-cyan-300/20 shadow-sm">ALT: 42m</div>
        <div className="absolute left-3 bottom-3 bg-slate-900/60 rounded px-2 py-1 border border-cyan-300/20 shadow-sm">SPD: 12km/h</div>
        <div className="absolute right-3 top-3 bg-slate-900/60 rounded px-2 py-1 border border-cyan-300/20 shadow-sm">LAT: 84ms</div>
        <div className="absolute right-3 bottom-3 bg-slate-900/60 rounded px-2 py-1 border border-cyan-300/20 shadow-sm">GPS LOCK</div>
      </div>
      {/* Cinematic inner shadow */}
      <div className="pointer-events-none absolute inset-0 z-20 rounded-[28px] ring-2 ring-cyan-300/10 shadow-[inset_0_0_60px_8px_rgba(2,6,23,0.45)]" />
      {/* Scan shimmer */}
      <div className="pointer-events-none absolute inset-0 z-20 animate-hud-scan bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent" style={{backgroundSize:'200% 100%',backgroundPosition:'-100% 0'}} />
    </>
  );
}

export default VideoStream;

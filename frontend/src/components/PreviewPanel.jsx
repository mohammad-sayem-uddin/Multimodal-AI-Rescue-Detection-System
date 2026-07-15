import { LoaderCircle, PlayCircle, ScanLine } from "lucide-react";

function PreviewPanel({ previewUrl, fileType, detectionResult, isAnalyzing }) {
  const overlay = detectionResult?.objects?.[0];

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
        Preview
      </p>

      <div className="mt-4">
        <div className="camera-panel relative aspect-video overflow-hidden rounded-[24px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.12),transparent_32%),linear-gradient(160deg,#f8fafc,#e2e8f0)] transition-all duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.16),transparent_30%),linear-gradient(160deg,#050505,#0b0b0f)]">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(0,245,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.08)_1px,transparent_1px)] [background-size:36px_36px] dark:opacity-35 dark:[background-image:linear-gradient(rgba(0,245,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.1)_1px,transparent_1px)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,250,252,0.12)_45%,rgba(226,232,240,0.82)_100%)] transition-all duration-300 dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.08)_50%,rgba(5,5,5,0.75)_100%)]" />
          <div className="scan-line absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/0 via-cyan-300/12 to-cyan-300/0 dark:via-cyan-400/14" />

          {previewUrl ? (
            <>
              {fileType === "image" ? (
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              {overlay ? (
                <div
                  className="absolute rounded-xl border-2 border-emerald-400 shadow-[0_0_22px_rgba(0,255,156,0.22)]"
                  style={{
                    left: `${overlay.bbox.left}%`,
                    top: `${overlay.bbox.top}%`,
                    width: `${overlay.bbox.width}%`,
                    height: `${overlay.bbox.height}%`,
                  }}
                >
                  <div className="absolute -top-7 left-0 rounded-md border border-emerald-400/30 bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                    {overlay.label} {overlay.confidence.toFixed(2)}
                  </div>
                </div>
              ) : null}

              {isAnalyzing ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
                  <div className="rounded-3xl border border-cyan-400/20 bg-white/75 px-6 py-5 text-center shadow-[0_0_30px_rgba(34,211,238,0.14)] dark:bg-black/45">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-cyan-500 dark:text-cyan-300" />
                    <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                      Analyzing...
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-3xl border border-slate-200/70 bg-white/75 px-6 py-5 text-center backdrop-blur-xl dark:border-white/10 dark:bg-black/35">
                <ScanLine className="mx-auto h-8 w-8 text-cyan-600 dark:text-cyan-300" />
                <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  Preview standby
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Upload media to render a live preview and simulated detection overlay.
                </p>
              </div>
            </div>
          )}

          {fileType === "video" && previewUrl ? (
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-violet-700 dark:text-violet-200">
              <PlayCircle className="h-3.5 w-3.5" />
              Video Mode
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;

import { Mic, MicOff } from "lucide-react";

function AudioControls({ isListening, onStart, onStop }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(16,185,129,0.08)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
        Microphone Control
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={isListening}
          className="neon-button inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-700 transition-all duration-300 ease-out hover:scale-[1.03] hover:border-cyan-300/45 hover:bg-cyan-400/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:text-cyan-100"
        >
          <Mic className="h-4 w-4" />
          Start Listening
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isListening}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/80 bg-white/70 px-5 py-3 text-sm font-medium text-slate-700 transition-all duration-300 ease-out hover:scale-[1.03] hover:border-violet-300/60 hover:bg-violet-400/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-black/20 dark:text-slate-100 dark:hover:border-violet-400/30 dark:hover:bg-violet-400/10"
        >
          <MicOff className="h-4 w-4" />
          Stop Listening
        </button>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
        Simulated audio confidence updates stream every 500ms to mimic a live scream-detection
        pipeline.
      </p>
    </div>
  );
}

export default AudioControls;

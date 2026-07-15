import LiveClock from "./LiveClock";
import MissionStatus from "./MissionStatus";
import TelemetryIndicators from "./TelemetryIndicators";
import ModeSwitch from "./ModeSwitch";
import AlertBadge from "./AlertBadge";
import AIThinkingIndicator from "./AIThinkingIndicator";
import { useOperationalState } from "../context/OperationalStateContext";
import { Shield, Cpu, Wifi, BatteryFull, Zap } from "lucide-react";

function Header({ title, theme, toggleTheme }) {
  const { state: opState, visionConfidence, systemStability } = useOperationalState();
  // Priority mapping for center
  const modeShort = opState.slice(0, 3).toUpperCase();
  const threatShort = {
    HIGH: <Shield className="inline w-4 h-4 text-rose-500 mr-1" />,
    MEDIUM: <Shield className="inline w-4 h-4 text-amber-400 mr-1" />,
    LOW: <Shield className="inline w-4 h-4 text-emerald-400 mr-1" />,
    CRITICAL: <Shield className="inline w-4 h-4 text-rose-700 animate-pulse mr-1" />,
    ALERT: <Shield className="inline w-4 h-4 text-amber-500 animate-pulse mr-1" />,
    IDLE: <Shield className="inline w-4 h-4 text-cyan-400 mr-1" />,
  }[opState] || <Shield className="inline w-4 h-4 text-cyan-400 mr-1" />;
  return (
    <header className="sticky top-0 z-30 px-2 pb-2 pt-2 md:px-4 lg:px-8">
      <div className="glass-elevated rounded-[12px] border border-slate-200/20 bg-white/80 px-2 py-1.5 backdrop-blur-xl shadow-[0_4px_12px_rgba(14,165,233,0.03)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-white/[0.025] dark:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between gap-2 min-h-[34px]">
          {/* LEFT: Mission Identity & Drone Status */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-700/80 dark:text-cyan-300/70 select-none">R-01</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-cyan-100/30 dark:bg-cyan-900/20 border border-cyan-300/10">
              <Zap className="w-3 h-3 mr-1 text-cyan-400" />
              D:ON
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-emerald-100/30 dark:bg-emerald-900/20 border border-emerald-300/10">
              <Cpu className="w-3 h-3 mr-1 text-emerald-400" />
              {modeShort}
            </span>
          </div>

          {/* CENTER: AI State, Telemetry, Tracking, AI Thinking */}
          <div className="flex flex-col items-center gap-0 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* Threat, Mode, AI Status */}
              <span className="flex items-center gap-1 text-base font-semibold text-slate-800 dark:text-white">
                {threatShort}
                {opState}
              </span>
              <span className="hidden md:inline-block h-4 w-px bg-slate-300/15 dark:bg-slate-700/30 mx-2 rounded" />
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/80 dark:text-cyan-300/70 opacity-90">
                <Cpu className="w-3 h-3" />AI
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/70 dark:text-cyan-300/60 opacity-80">
                <Wifi className="w-3 h-3" />SIG
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/70 dark:text-cyan-300/60 opacity-80">
                <BatteryFull className="w-3 h-3" />{92}%
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/60 dark:text-cyan-300/50 opacity-70">
                FPS 29
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/60 dark:text-cyan-300/50 opacity-70">
                LAT 84
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/60 dark:text-cyan-300/50 opacity-70">
                VSN {visionConfidence}
              </span>
              <AIThinkingIndicator />
            </div>
          </div>

          {/* RIGHT: Clock, Connectivity, Profile/Settings */}
          <div className="flex items-center gap-2 min-w-0">
            <LiveClock />
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-cyan-400/60 dark:text-cyan-300/50 px-1.5 py-0.5 rounded border border-cyan-300/10 bg-white/20 dark:bg-cyan-900/10">
              <Wifi className="w-3 h-3" />
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="group neon-button inline-flex items-center gap-1 rounded-full border border-cyan-300/15 bg-white/50 px-2 py-1 text-xs font-medium text-slate-800 shadow-[0_0_6px_rgba(34,211,238,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:border-violet-400/20 hover:shadow-[0_0_10px_rgba(124,58,237,0.07)] active:scale-[0.98] dark:border-cyan-400/10 dark:bg-cyan-400/5 dark:text-cyan-50 dark:shadow-[0_0_4px_rgba(0,245,255,0.04)]"
              aria-label="Toggle theme"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/30 bg-white/80 text-base transition-all duration-300 group-hover:scale-105 dark:border-white/10 dark:bg-black/20">
                {theme === "dark" ? "☀️" : "🌙"}
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Optional: ModeSwitch or other controls */}
      <div className="mt-1"><ModeSwitch /></div>
    </header>
  );
}

export default Header;

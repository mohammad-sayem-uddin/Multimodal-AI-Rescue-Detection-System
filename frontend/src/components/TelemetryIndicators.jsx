import { Wifi, Cpu, BatteryFull } from "lucide-react";

export default function TelemetryIndicators({
  battery = 92,
  signal = "STRONG",
  latency = 84,
  aiActive = true,
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Battery */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 dark:bg-slate-900/40 border border-cyan-300/20 text-xs font-mono text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.08)]">
        <BatteryFull className="w-3.5 h-3.5 mr-1 text-cyan-300" />
        BAT {battery}%
      </div>
      {/* Signal */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 dark:bg-slate-900/40 border border-cyan-300/20 text-xs font-mono text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.08)] animate-pulse-signal">
        <Wifi className="w-3.5 h-3.5 mr-1 text-cyan-300" />
        SIG {signal}
      </div>
      {/* Latency */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 dark:bg-slate-900/40 border border-cyan-300/20 text-xs font-mono text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.08)]">
        {latency}ms
      </div>
      {/* AI Core */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-mono shadow-[0_0_8px_rgba(34,211,238,0.13)] ${aiActive ? "bg-cyan-400/10 border-cyan-300/40 text-cyan-300 animate-glow-ai" : "bg-slate-400/10 border-slate-400/30 text-slate-400"}`}>
        <Cpu className="w-3.5 h-3.5 mr-1" />
        AI {aiActive ? "ACTIVE" : "IDLE"}
      </div>
    </div>
  );
}

export default function MissionStatus({ missionId = "RD-01", mode = "TRACKING", threat = "LOW" }) {
  return (
    <div className="flex items-center gap-4 text-[13px] font-medium text-slate-700 dark:text-slate-200">
      <div className="flex items-center gap-1">
        <span className="text-cyan-400 font-mono">MISSION</span>
        <span className="ml-1 font-mono text-cyan-300/80">{missionId}</span>
      </div>
      <span className="mx-2 h-3 w-px bg-slate-300/30 dark:bg-slate-700/60 rounded" />
      <div className="flex items-center gap-1">
        <span className="text-cyan-400 font-mono">MODE</span>
        <span className="ml-1 font-mono text-cyan-300/80">{mode}</span>
      </div>
      <span className="mx-2 h-3 w-px bg-slate-300/30 dark:bg-slate-700/60 rounded" />
      <div className="flex items-center gap-1">
        <span className="text-cyan-400 font-mono">THREAT</span>
        <span className="ml-1 font-mono text-cyan-300/80">{threat}</span>
      </div>
    </div>
  );
}

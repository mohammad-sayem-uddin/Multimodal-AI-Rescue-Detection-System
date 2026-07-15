import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function AudioGraph({ data, isListening }) {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-violet-600/80 transition-all duration-300 dark:text-violet-300/75">
            Live Confidence Graph
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">
            Acoustic event confidence
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-700 transition-all duration-300 dark:text-cyan-200">
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              isListening
                ? "bg-cyan-400 shadow-[0_0_14px_rgba(0,245,255,0.8)]"
                : "bg-slate-400 shadow-none",
            ].join(" ")}
          />
          {isListening ? "Live" : "Idle"}
        </div>
      </div>

      <div className="mt-6 h-[320px] rounded-[26px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(240,249,255,0.45))] p-4 transition-all duration-300 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.26),rgba(6,10,18,0.42))]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
            />
            <Tooltip content={<GraphTooltip />} cursor={{ stroke: "rgba(34,211,238,0.25)", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#00f5ff"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5, fill: "#00f5ff", stroke: "#7c3aed", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GraphTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/90 px-3 py-2 text-xs text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="uppercase tracking-[0.28em] text-cyan-300/80">{label}</p>
      <p className="mt-1 font-medium text-white">Confidence: {payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default AudioGraph;

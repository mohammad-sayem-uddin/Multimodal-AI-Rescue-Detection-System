import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EVENT_TYPES = {
  DETECTION: { icon: "🎯", color: "cyan" },
  AUDIO: { icon: "🔊", color: "amber" },
  ALERT: { icon: "⚠️", color: "rose" },
  SNAPSHOT: { icon: "📸", color: "violet" },
  SYSTEM: { icon: "💻", color: "slate" },
  TRACKING: { icon: "📡", color: "emerald" },
  WARNING: { icon: "🚨", color: "amber" },
};

const PRIORITY = {
  LOW: "border-slate-200/70",
  MEDIUM: "border-amber-300/40",
  HIGH: "border-rose-400/40",
  CRITICAL: "border-rose-600/70",
};

const TYPE_STYLES = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-200",
  rose: "border-rose-400/20 bg-rose-500/10 text-rose-700 dark:text-rose-200",
  violet: "border-violet-400/20 bg-violet-400/10 text-violet-700 dark:text-violet-200",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200",
  slate: "border-slate-200/70 bg-white/55 text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-200",
};

function EventTimelinePro({ events, filter, search }) {
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events]);

  // Filtering and searching
  const filtered = events.filter(e =>
    (filter === "ALL" || e.type === filter) &&
    (!search || e.message.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(124,58,237,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-violet-600/80 transition-all duration-300 dark:text-violet-300/75">
            Operational Memory
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">
            Event Timeline
          </h2>
        </div>
        <div className="flex gap-2 items-center">
          <TimelineFilters filter={filter} />
          <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-violet-700 transition-all duration-300 dark:text-violet-200">
            {filtered.length} events
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          className="w-full rounded-lg border border-slate-200/60 bg-white/80 px-3 py-1 text-xs font-mono tracking-wide text-slate-700 shadow-inner outline-none transition-all duration-200 focus:border-violet-400 dark:border-white/10 dark:bg-black/20 dark:text-violet-100"
          placeholder="Search mission events..."
          value={search}
          onChange={() => {}}
          readOnly
        />
      </div>
      <div
        ref={containerRef}
        className="mt-6 max-h-[360px] space-y-3 overflow-y-auto pr-2"
      >
        <AnimatePresence initial={false}>
          {filtered.slice(0, 30).map((event) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className={`rounded-2xl border p-4 opacity-100 transition-all duration-300 ease-out ${TYPE_STYLES[EVENT_TYPES[event.type]?.color || "slate"]} ${PRIORITY[event.priority]}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{EVENT_TYPES[event.type]?.icon || "•"}</span>
                  <time className="text-xs uppercase tracking-[0.28em] text-slate-500 transition-all duration-300 dark:text-slate-400">
                    [{event.timestamp}]
                  </time>
                  <span className="ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 bg-white/70 border-slate-300/60 text-slate-700 dark:bg-black/20 dark:text-violet-100">
                    {event.type}
                  </span>
                  <span className={`ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${PRIORITY[event.priority]}`}>
                    {event.priority}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700 transition-all duration-300 dark:text-slate-200">
                {event.message}
              </p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TimelineFilters({ filter }) {
  const filters = ["ALL", "ALERT", "AUDIO", "DETECTION", "SYSTEM", "TRACKING", "SNAPSHOT", "WARNING"];
  return (
    <div className="flex gap-1">
      {filters.map((f) => (
        <button
          key={f}
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${filter === f ? "bg-violet-500/10 border-violet-400 text-violet-700 dark:text-violet-200" : "bg-white/70 border-slate-200/60 text-slate-500 dark:bg-black/20 dark:text-violet-100"}`}
          style={{ minWidth: 44 }}
          tabIndex={0}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export default EventTimelinePro;

import { Activity, AudioLines, FlaskConical } from "lucide-react";
import { NavLink } from "react-router-dom";

const MODES = [
  {
    to: "/",
    label: "Real-Time",
    icon: Activity,
  },
  {
    to: "/testing",
    label: "Testing",
    icon: FlaskConical,
  },
  {
    to: "/audio",
    label: "Audio",
    icon: AudioLines,
  },
];

function ModeSwitch() {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/55 p-2 backdrop-blur-2xl shadow-[0_14px_44px_rgba(14,165,233,0.07)] transition-all duration-300 dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_14px_44px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;

          return (
            <NavLink
              key={mode.to}
              to={mode.to}
              className={({ isActive }) =>
                [
                  "group relative inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.985]",
                  isActive
                    ? "border-cyan-400/45 bg-cyan-400/12 text-slate-950 shadow-[0_0_24px_rgba(14,165,233,0.14)] dark:text-white dark:shadow-[0_0_28px_rgba(0,245,255,0.16)]"
                    : "border-slate-200/70 bg-white/65 text-slate-700 hover:border-violet-400/35 hover:bg-violet-500/8 hover:text-slate-950 hover:shadow-[0_0_18px_rgba(124,58,237,0.12)] dark:border-white/8 dark:bg-white/[0.025] dark:text-slate-300 dark:hover:text-white dark:hover:shadow-[0_0_22px_rgba(124,58,237,0.16)]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "absolute inset-y-2 left-1 w-1 rounded-full transition-all duration-300",
                      isActive
                        ? "bg-cyan-400 shadow-[0_0_16px_rgba(0,245,255,0.8)]"
                        : "bg-transparent group-hover:bg-violet-400/70",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300",
                      isActive
                        ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-600 dark:text-cyan-300"
                        : "border-slate-200/70 bg-white/80 text-slate-500 group-hover:scale-105 group-hover:border-violet-400/30 group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:border-white/10 dark:bg-black/20 dark:text-slate-400 dark:group-hover:text-violet-200",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="uppercase tracking-[0.18em]">{mode.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default ModeSwitch;

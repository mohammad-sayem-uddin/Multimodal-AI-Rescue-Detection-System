import { Activity, AudioLines, FlaskConical, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    to: "/",
    label: "Real-Time Monitor",
    icon: Activity,
  },
  {
    to: "/testing",
    label: "Image/Video Testing",
    icon: FlaskConical,
  },
  {
    to: "/audio",
    label: "Audio Detection",
    icon: AudioLines,
  },
];

function Sidebar({ isCollapsed, isHovered, onHoverChange }) {
  const effectivelyCollapsed = isCollapsed && !isHovered;

  return (
    <aside
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={`glass-elevated z-40 transition-all duration-300 ease-out 
        fixed inset-x-0 top-0 border-b border-slate-200/60 bg-white/52 backdrop-blur-2xl dark:border-white/10 dark:bg-black/36 
        lg:sticky lg:top-0 lg:h-screen lg:inset-y-auto lg:left-auto lg:right-auto lg:border-b-0 lg:border-r ${
        effectivelyCollapsed ? "lg:w-[78px]" : "lg:w-[260px]"
      }`}
    >
      <div className={`flex h-full flex-col p-4 overflow-y-auto transition-all duration-300 ${effectivelyCollapsed ? "lg:p-3" : "lg:p-6"}`}>
        <div className="logo-tilt soft-panel-hover mb-5 flex items-center gap-3 rounded-3xl border border-cyan-300/[0.24] bg-white/[0.68] px-3 py-4 shadow-[0_0_30px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out hover:scale-[1.02] dark:border-cyan-400/[0.16] dark:bg-white/[0.03] dark:shadow-[0_0_40px_rgba(0,245,255,0.06)] overflow-hidden">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/10 text-cyan-600 shadow-[0_0_18px_rgba(14,165,233,0.14)] transition-all duration-300 dark:border-cyan-400/30 dark:text-cyan-300 dark:shadow-[0_0_24px_rgba(0,245,255,0.18)]">
            <Shield className="h-6 w-6" />
          </div>
          <div className={`transition-all duration-300 whitespace-nowrap ${effectivelyCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"}`}>
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/80">
              AI Control
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">
              Rescue AI
            </h1>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "sidebar-tilt soft-panel-hover group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 transition-all duration-300 ease-out active:scale-[0.985]",
                    isActive
                      ? "border-cyan-400/[0.38] bg-cyan-400/[0.09] text-slate-950 shadow-[0_0_24px_rgba(14,165,233,0.12)] dark:text-white dark:shadow-[0_0_26px_rgba(0,245,255,0.14)]"
                      : "border-slate-200/[0.65] bg-white/[0.52] text-slate-700 hover:translate-x-1 hover:border-violet-400/[0.26] hover:bg-violet-500/[0.07] hover:text-slate-950 dark:border-white/8 dark:bg-white/[0.022] dark:text-slate-300 dark:hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        "absolute inset-y-2 left-1 w-1 rounded-full transition-all duration-300 ease-out",
                        isActive
                          ? "bg-cyan-400 shadow-[0_0_18px_rgba(0,245,255,0.8)] sidebar-pulse"
                          : "bg-transparent group-hover:bg-violet-400/70 group-hover:shadow-[0_0_14px_rgba(124,58,237,0.55)]",
                      ].join(" ")}
                    />
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition-all duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_left,rgba(0,245,255,0.08),transparent_40%),linear-gradient(90deg,rgba(124,58,237,0.08),transparent)]" />
                    <div
                      className={[
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ease-out",
                        isActive
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-600 shadow-[0_0_16px_rgba(14,165,233,0.16)] dark:text-cyan-300"
                          : "border-slate-200/70 bg-white/70 text-slate-500 group-hover:scale-105 group-hover:border-violet-400/30 group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:border-white/10 dark:bg-black/20 dark:text-slate-400 dark:group-hover:text-violet-200",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={`min-w-0 transition-all duration-300 whitespace-nowrap ${effectivelyCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"}`}>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500 transition-all duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-400">
                        Neural operations module
                      </p>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={`soft-panel-hover rounded-3xl border border-emerald-400/[0.18] bg-emerald-400/[0.07] p-4 text-sm text-slate-700 shadow-[0_0_24px_rgba(16,185,129,0.06)] transition-all duration-300 ease-out dark:text-slate-200 dark:shadow-[0_0_30px_rgba(0,255,156,0.06)] hidden lg:block overflow-hidden ${effectivelyCollapsed ? "h-0 opacity-0 invisible mt-0 p-0" : "h-auto opacity-100 visible mt-5"}`}>
          <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-600/80 transition-all duration-300 dark:text-emerald-300/80">
            System Link
          </p>
          <p className="mt-3 leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
            Multi-modal monitoring shell prepared for camera, audio, and test pipelines.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

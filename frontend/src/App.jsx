import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AISystemBoot from "./components/AISystemBoot";
import AlertToast from "./components/AlertToast";
import GlobalAlertBanner from "./components/GlobalAlertBanner";
import Header from "./components/Header";
import PageTransition from "./components/PageTransition";
import Sidebar from "./components/Sidebar";
import SubsystemStatus from "./components/SubsystemStatus";
import { ThreatProvider, useThreat } from "./context/ThreatContext";
import { useTheme } from "./hooks/useTheme";
import Audio from "./pages/Audio";
import RealTime from "./pages/RealTime";
import Testing from "./pages/Testing";

/* Total boot overlay duration before dashboard becomes interactive.
   Keep ≤ 3 s so it never feels long. */
const BOOT_DURATION_MS = 3100;

function App() {
  return (
    <ThreatProvider>
      <AppShell />
    </ThreatProvider>
  );
}

function AppShell() {
  const location  = useLocation();
  const pageTitle = resolvePageTitle(location.pathname);
  const { theme, toggleTheme } = useTheme();
  const { cfg }   = useThreat();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);

  /* ── Boot state (global, runs once) ─────────────────────────── */
  const [booting,    setBooting]    = useState(true);
  const [bootDone,   setBootDone]   = useState(false);

  /* Sidebar collapse on scroll */
  useEffect(() => {
    const handleScroll = () => setIsCollapsed(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Safety fallback: force-complete boot */
  useEffect(() => {
    const t = setTimeout(() => {
      setBooting(false);
      setBootDone(true);
    }, BOOT_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const handleBootComplete = () => {
    setBooting(false);
    setTimeout(() => setBootDone(true), 520);
  };

  /* Threat-reactive orb intensity */
  const orbAlpha  = cfg.borderAlpha;          // 0.14 → 0.50
  const orbScale  = cfg.orbScale;             // 1.0  → 1.26
  const accentRgb = cfg.accentRgb;

  return (
    <div
      className="dashboard-shell relative min-h-screen overflow-x-hidden bg-slate-100 text-slate-950 transition-all duration-700 ease-out dark:bg-[#050505] dark:text-slate-100"
      style={{ "--threat-accent": `rgba(${accentRgb},${orbAlpha})` }}
    >
      {/* ── AI System Boot overlay ─────────────────────────────── */}
      {booting && <AISystemBoot onComplete={handleBootComplete} />}

      {/* ── Global alert banner (sits above content, below boot) ─ */}
      <GlobalAlertBanner />

      <AlertToast />

      {/* Ambient background orbs — subtly reactive to threat ───── */}
      <div
        className="control-room-grid pointer-events-none absolute inset-0"
        style={{
          transform: `scale(${orbScale})`,
          transformOrigin: "center top",
          transition: "transform 1.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          className="app-orb absolute -left-24 top-12 h-[28rem] w-[28rem] rounded-full blur-[120px]"
          style={{
            background: `rgba(${accentRgb}, ${orbAlpha * 0.8})`,
            transition: "background 1.2s ease-out",
          }}
        />
        <div
          className="app-orb absolute right-[-4rem] top-[-2rem] h-[32rem] w-[32rem] rounded-full blur-[140px]"
          style={{
            background: `rgba(${accentRgb}, ${orbAlpha * 0.65})`,
            transition: "background 1.2s ease-out",
          }}
        />
        <div className="app-orb absolute bottom-[-5rem] left-1/4 h-80 w-80 rounded-full bg-emerald-400/[0.07] blur-[120px] dark:bg-emerald-400/[0.08]" />
        <div className="app-orb absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/[0.05] blur-[100px] dark:bg-cyan-300/[0.06]" />
      </div>

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div
        className="relative flex min-h-screen w-full gap-0 lg:gap-5"
        style={{
          opacity:       booting ? 0 : 1,
          filter:        booting ? "blur(4px)" : "none",
          transition:    "opacity 0.5s ease-out, filter 0.5s ease-out",
          pointerEvents: booting ? "none" : "auto",
        }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          isHovered={isHovered}
          onHoverChange={setIsHovered}
        />

        <div className="flex min-h-screen flex-1 flex-col pt-36 transition-all duration-300 ease-out lg:pt-0">
          <Header title={pageTitle} theme={theme} toggleTheme={toggleTheme} />

          {/* Subsystem activation chip strip — appears after boot */}
          <SubsystemStatus visible={bootDone} />

          <main className="flex-1 px-6 pb-6 pt-2 lg:px-8">
            <PageTransition>
              <Routes location={location}>
                <Route path="/"        element={<RealTime />} />
                <Route path="/testing" element={<Testing />} />
                <Route path="/audio"   element={<Audio />} />
                <Route path="*"        element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}

function resolvePageTitle(pathname) {
  if (pathname === "/testing") return "Image / Video Testing";
  if (pathname === "/audio")   return "Audio Detection";
  return "Real-Time Monitor";
}

export default App;

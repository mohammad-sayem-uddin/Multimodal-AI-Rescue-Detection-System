import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BellRing, Radar, TimerReset } from "lucide-react";
import AudioControls from "../components/AudioControls";
import AudioGraph from "../components/AudioGraph";
import AudioStatus from "../components/AudioStatus";
import { useOperationalState } from "../context/OperationalStateContext";
import AIStatusBar from "../components/AIStatusBar";
import AISystemBoot from "../components/AISystemBoot";

const MAX_POINTS = 24;

function Audio() {
  const intervalRef = useRef(null);
  const sampleRef = useRef(0);
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0.12);
  const [history, setHistory] = useState(() => createInitialHistory());
  const { state, setOperationalState } = useOperationalState();
  const [booting, setBooting] = useState(true);

  const status = useMemo(() => resolveStatus(confidence), [confidence]);
  const alertActive = confidence > 0.5;

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    setIsListening(true);
    intervalRef.current = window.setInterval(() => {
      sampleRef.current += 1;

      const nextConfidence = generateConfidence(sampleRef.current);
      const point = {
        time: formatTick(sampleRef.current),
        confidence: nextConfidence,
      };

      setConfidence(nextConfidence);
      setHistory((current) => [...current.slice(-(MAX_POINTS - 1)), point]);
    }, 500);
  };

  const handleStop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsListening(false);
  };

  return (
    <>
      {booting && <AISystemBoot onComplete={() => setBooting(false)} />}
      <main className={`min-h-screen px-4 py-4 md:px-8 md:py-6 transition-opacity duration-500 ${booting ? "opacity-40 pointer-events-none blur-sm" : "opacity-100"}`}>
        <AIStatusBar />
        <div className="grid gap-6">
          {/* Cinematic Header */}
          <header className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md mt-10">
            <h1 className="text-3xl font-bold">AI Acoustic Operations Console</h1>
            <p className="mt-2 text-sm">Operational Status: {state}</p>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
            {/* Left Panel */}
            <section className="grid gap-5">
              <AudioControls isListening={isListening} onStart={handleStart} onStop={handleStop} />

              <AudioStatus confidence={confidence} isListening={isListening} status={status} />

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  icon={Activity}
                  label="Current Confidence"
                  value={confidence.toFixed(2)}
                  accent="cyan"
                />
                <MetricCard
                  icon={Radar}
                  label="Detection Status"
                  value={status}
                  accent={status === "SCREAM" ? "rose" : status === "POSSIBLE" ? "amber" : "emerald"}
                />
                <MetricCard
                  icon={TimerReset}
                  label="Samples Tracked"
                  value={String(history.length).padStart(2, "0")}
                  accent="violet"
                />
              </div>
            </section>

            {/* Right Panel */}
            <section className="grid gap-5">
              <AudioGraph data={history} isListening={isListening} />

              <div className={`p-4 rounded-lg shadow-md dark:bg-gray-800 transition-colors duration-700 ${
                state === "CRITICAL"
                  ? "bg-rose-100 border-rose-300/40 animate-pulse"
                  : state === "ALERT"
                  ? "bg-amber-100 border-amber-300/40 animate-pulse"
                  : state === "TRACKING"
                  ? "bg-emerald-100 border-emerald-300/40"
                  : state === "ANALYZING"
                  ? "bg-indigo-100 border-indigo-300/40"
                  : state === "MONITORING"
                  ? "bg-blue-100 border-blue-300/40"
                  : "bg-white border-slate-200"
              }`}>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Event Feed
                  {state === "ALERT" && <span className="text-amber-500 animate-pulse">●</span>}
                  {state === "CRITICAL" && <span className="text-rose-500 animate-pulse">●</span>}
                </h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {history.map((event, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{event.time}</span>
                      <span className={
                        state === "CRITICAL"
                          ? "text-rose-500"
                          : state === "ALERT"
                          ? "text-amber-500"
                          : state === "TRACKING"
                          ? "text-emerald-500"
                          : state === "ANALYZING"
                          ? "text-indigo-500"
                          : state === "MONITORING"
                          ? "text-blue-500"
                          : "text-slate-700 dark:text-slate-200"
                      }>{event.confidence.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Bottom Panel */}
          <section className="p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-900">
            <h2 className="text-lg font-semibold">Waveform & Spectrum Analytics</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Placeholder for future visualizations.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, accent = "cyan" }) {
  const accentClass =
    accent === "rose"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-200"
      : accent === "amber"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-200"
        : accent === "emerald"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200"
          : accent === "violet"
            ? "border-violet-400/20 bg-violet-400/10 text-violet-600 dark:text-violet-200"
            : "border-cyan-400/20 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200";

  return (
    <div className="rounded-[26px] border border-slate-200/70 bg-white/60 p-4 backdrop-blur-2xl shadow-[0_22px_60px_rgba(14,165,233,0.06)] transition-all duration-300 ease-out hover:scale-[1.015] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
      <div className={["inline-flex rounded-2xl border p-3 transition-all duration-300", accentClass].join(" ")}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">{value}</p>
    </div>
  );
}

function resolveStatus(confidence) {
  if (confidence < 0.25) {
    return "NORMAL";
  }

  if (confidence <= 0.5) {
    return "POSSIBLE";
  }

  return "SCREAM";
}

function createInitialHistory() {
  return Array.from({ length: 12 }, (_, index) => {
    const confidence = Number((0.12 + index * 0.018).toFixed(2));

    return {
      time: formatTick(index),
      confidence,
    };
  });
}

function formatTick(step) {
  return `${String(Math.floor(step / 2)).padStart(2, "0")}:${step % 2 === 0 ? "00" : "30"}`;
}

function generateConfidence(step) {
  const wave = (Math.sin(step / 2.3) + 1) / 2;
  const accent = (Math.sin(step / 5.1 + 1.2) + 1) / 2;
  const noise = Math.random() * 0.12;
  const value = 0.05 + wave * 0.42 + accent * 0.28 + noise;

  return Number(Math.max(0.05, Math.min(0.95, value)).toFixed(2));
}

export default Audio;

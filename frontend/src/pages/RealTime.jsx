import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Bot, Radar, ShieldCheck, Siren, UserRound } from "lucide-react";
import ControlPanel from "../components/ControlPanel";
import DecisionPanel from "../components/DecisionPanel";
import DroneHUD from "../components/DroneHUD";
import EventTimeline from "../components/EventTimeline";
import GlassSkeleton from "../components/GlassSkeleton";
import MapPanel from "../components/MapPanel";
import MetricsPanel from "../components/MetricsPanel";
import SnapshotPanel from "../components/SnapshotPanel";
import SoundControl from "../components/SoundControl";
import SystemStatus from "../components/SystemStatus";
import { useOperationalState } from "../context/OperationalStateContext";
import { useThreat } from "../context/ThreatContext";

function RealTime() {
  const stepRef = useRef(0);
  const hasLoggedPowerStateRef = useRef(false);
  const alertAudioRef = useRef(null);
  const lastAlertAtRef = useRef(0);
  const repeatTimeoutsRef = useRef([]);
  const [personDetected, setPersonDetected] = useState(false);
  const [screamDetected, setScreamDetected] = useState(false);
  const [personConfidence, setPersonConfidence] = useState(0.18);
  const [screamConfidence, setScreamConfidence] = useState(0.09);
  const [events, setEvents] = useState(() => createInitialEvents());
  const [snapshots, setSnapshots] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(70);
  const [threshold, setThreshold] = useState(0.5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [targetPosition, setTargetPosition] = useState({
    lat: 23.8112,
    lng: 90.413,
  });
  const [metrics, setMetrics] = useState({
    personsDetectedTotal: 0,
    averageConfidence: 0.0,
    alertsTriggered: 0,
    detectionRate: 0,
    systemLatency: 62,
    confidenceSamples: 0,
    confidenceSum: 0,
  });
  /* contentReady: short delay after mount to let panels animate in */
  const [contentReady, setContentReady] = useState(false);

  const { state: opState } = useOperationalState();
  const { updateThreat }   = useThreat();

  /* Drive global ThreatContext from decisionState */
  const prevThreatRef = useRef("NONE");
  useEffect(() => {
    const next = decisionState?.threat ?? "NONE";
    if (next === prevThreatRef.current) return;

    const prev = prevThreatRef.current;
    prevThreatRef.current = next;
    updateThreat(next);

    /* Emit escalation / recovery events into the timeline */
    const ts = formatTimelineTime(stepRef.current);
    const RANK = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
    if ((RANK[next] ?? 0) > (RANK[prev] ?? 0)) {
      const msg = next === "HIGH"
        ? "Multi-signal escalation · emergency protocol active"
        : next === "MEDIUM"
          ? "Audio threat escalated · scan mode elevated"
          : "Target acquired · track mode initiated";
      setEvents(cur => [...cur, createEvent("alert", ts, `[ESCALATION] ${msg}`)].slice(-15));
    } else if ((RANK[next] ?? 0) < (RANK[prev] ?? 0)) {
      const msg = next === "NONE"
        ? "Threat stabilised · system returned to monitoring"
        : next === "LOW"
          ? "Audio cleared · track lock regained"
          : "Threat level reduced · de-escalation in progress";
      setEvents(cur => [...cur, createEvent("system", ts, `[RECOVERY] ${msg}`)].slice(-15));
    }
  // We only want this to trigger when decisionState.threat changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionState?.threat, updateThreat]);
  const cameraConnected = true;
  const isListening = aiEnabled;
  const modelLoaded = true;
  const gpsAvailable = false;
  const dronePosition = useMemo(
    () => ({
      lat: 23.8103,
      lng: 90.4125,
    }),
    [],
  );

  useEffect(() => {
    alertAudioRef.current = new Audio("/alert.wav");
    alertAudioRef.current.preload = "auto";

    const intervalId = window.setInterval(() => {
      if (!aiEnabled) {
        return;
      }

      stepRef.current += 1;
      const snapshot = getScenario(stepRef.current, sensitivity, threshold);
      const timestamp = formatTimelineTime(stepRef.current);
      const nextEvents = [];

      setPersonDetected(snapshot.personDetected);
      setScreamDetected(snapshot.screamDetected);
      setPersonConfidence(snapshot.personConfidence);
      setScreamConfidence(snapshot.screamConfidence);
      setTargetPosition(snapshot.targetPosition);

      if (snapshot.personDetected) {
        nextEvents.push(
          createEvent("detection", timestamp, `Person detected (${snapshot.personConfidence.toFixed(2)})`),
        );
      } else {
        nextEvents.push(createEvent("system", timestamp, "Visual sector clear, no person tracked"));
      }

      if (snapshot.screamDetected) {
        nextEvents.push(
          createEvent("scream", timestamp, `Scream detected (${snapshot.screamConfidence.toFixed(2)})`),
        );
      }

      const decision = resolveDecision(snapshot.personDetected, snapshot.screamDetected);
      if (decision.threat === "HIGH") {
        nextEvents.push(createEvent("alert", timestamp, "ALERT triggered by combined visual and audio threat"));
      } else if (decision.threat === "MEDIUM") {
        nextEvents.push(createEvent("system", timestamp, "Scan mode activated for audio anomaly follow-up"));
      } else if (decision.threat === "LOW") {
        nextEvents.push(createEvent("system", timestamp, "Track mode maintained for identified person"));
      } else {
        nextEvents.push(createEvent("system", timestamp, "Decision engine returned to idle monitoring"));
      }

      if (decision.threat === "HIGH" || (snapshot.personDetected && snapshot.screamDetected)) {
        const capturedSnapshot = createSnapshot({
          timestamp,
          confidence: snapshot.personConfidence,
          label: "person",
          threat: decision.threat,
        });

        setSnapshots((current) => [capturedSnapshot, ...current].slice(0, 3));
        nextEvents.push(createEvent("alert", timestamp, "Snapshot captured for alert evidence"));
      }

      setMetrics((current) => {
        const nextPersonsTotal =
          current.personsDetectedTotal + (snapshot.personDetected ? 1 : 0);
        const nextSamples = current.confidenceSamples + (snapshot.personDetected ? 1 : 0);
        const nextConfidenceSum =
          current.confidenceSum + (snapshot.personDetected ? snapshot.personConfidence : 0);
        const nextAverageConfidence =
          nextSamples > 0 ? nextConfidenceSum / nextSamples : current.averageConfidence;
        const nextAlerts =
          current.alertsTriggered + (decision.threat === "HIGH" ? 1 : 0);
        const nextDetectionRate = Math.max(
          0,
          Math.round(sensitivity * 0.18 + (snapshot.personDetected ? 6 : 0) + Math.random() * 4),
        );
        const nextLatency = Math.round(
          clamp(42 + sensitivity * 0.42 + Math.random() * 22 - (snapshot.personDetected ? 6 : 0), 40, 120),
        );

        return {
          personsDetectedTotal: nextPersonsTotal,
          averageConfidence: Number(nextAverageConfidence.toFixed(2)),
          alertsTriggered: nextAlerts,
          detectionRate: nextDetectionRate,
          systemLatency: nextLatency,
          confidenceSamples: nextSamples,
          confidenceSum: nextConfidenceSum,
        };
      });

      setEvents((current) => [...current, ...nextEvents].slice(-15));
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
      clearRepeatTimeouts(repeatTimeoutsRef);
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }
    };
  }, [aiEnabled, sensitivity, threshold]);

  useEffect(() => {
    if (!hasLoggedPowerStateRef.current) {
      hasLoggedPowerStateRef.current = true;
      return;
    }

    const timestamp = formatTimelineTime(stepRef.current);
    setEvents((current) =>
      [
        ...current,
        createEvent(
          "system",
          timestamp,
          aiEnabled ? "AI system resumed by operator" : "AI system paused by operator",
        ),
      ].slice(-15),
    );
  }, [aiEnabled]);

  const decisionState = useMemo(
    () =>
      aiEnabled
        ? resolveDecision(personDetected, screamDetected)
        : {
            decision: "SYSTEM PAUSED",
            threat: "NONE",
            reason: "Operator paused the AI system. Detection, alerts, and decisions are frozen.",
          },
    [aiEnabled, personDetected, screamDetected],
  );
  const alertMode = useMemo(() => {
    if (!aiEnabled) {
      return "SILENT";
    }

    if (decisionState.threat === "HIGH") {
      return "REPEATING ALERT";
    }

    if (screamDetected || decisionState.threat === "MEDIUM") {
      return "SHORT BEEP";
    }

    return "SILENT";
  }, [aiEnabled, decisionState.threat, screamDetected]);
  const systemStatuses = useMemo(
    () => [
      {
        label: "Camera",
        value: cameraConnected ? "Connected" : "Disconnected",
        tone: cameraConnected ? "ok" : "error",
      },
      {
        label: "Audio",
        value: isListening ? "Listening" : "Idle",
        tone: isListening ? "ok" : "warning",
      },
      {
        label: "Model",
        value: modelLoaded ? (aiEnabled ? "Loaded" : "Paused") : "Not Ready",
        tone: modelLoaded ? (aiEnabled ? "ok" : "warning") : "warning",
      },
      {
        label: "GPS",
        value: gpsAvailable ? "Available" : "Not Available",
        tone: gpsAvailable ? "ok" : "error",
      },
    ],
    [aiEnabled, cameraConnected, gpsAvailable, isListening, modelLoaded],
  );

  useEffect(() => {
    if (!soundEnabled || !aiEnabled) {
      clearRepeatTimeouts(repeatTimeoutsRef);
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }
      return;
    }

    const shouldAlert = decisionState.threat === "HIGH" || screamDetected;
    if (!shouldAlert) {
      clearRepeatTimeouts(repeatTimeoutsRef);
      return;
    }

    const now = Date.now();
    if (now - lastAlertAtRef.current < 2000) {
      return;
    }

    lastAlertAtRef.current = now;
    playAlertTone(alertAudioRef);

    if (decisionState.threat === "HIGH") {
      clearRepeatTimeouts(repeatTimeoutsRef);
      [650, 1300].forEach((delay) => {
        const timeoutId = window.setTimeout(() => {
          if (soundEnabled && decisionState.threat === "HIGH") {
            playAlertTone(alertAudioRef);
          }
        }, delay);
        repeatTimeoutsRef.current.push(timeoutId);
      });
    }
  }, [aiEnabled, decisionState.threat, screamDetected, soundEnabled]);

  /* Animate panels in shortly after component mounts */
  useEffect(() => {
    const t = setTimeout(() => setContentReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <main
        className="min-h-screen px-4 py-4 md:px-8 md:py-6"
        style={{
          opacity:    contentReady ? 1 : 0,
          transform:  contentReady ? "none" : "translateY(8px)",
          transition: "opacity 0.35s ease-out, transform 0.35s ease-out",
        }}
      >
        {!aiEnabled ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-[28px] border border-cyan-400/20 bg-slate-950/55 px-8 py-6 text-center backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/80">System State</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">AI SYSTEM PAUSED</h2>
              <p className="mt-3 text-sm text-slate-300">
                Operator controls are holding detections, alerts, and decisions in place.
              </p>
            </div>
          </div>
        ) : null}

        <div className={["grid gap-6 transition-all duration-300", !aiEnabled ? "opacity-55" : ""].join(" ")}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.72fr)_minmax(250px,0.48fr)]">
            <section className="grid gap-4">
              <SectionBlock
                eyebrow="Live Feed"
                title="Visual monitoring and captured evidence"
                detail="Primary operator focus area for scene awareness, target context, and alert evidence."
              />

              <GlassCard className="overflow-hidden" glow="cyan">
                <div className="flex items-center justify-between">
                  <SectionLabel label="Primary Camera" />
                  <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-cyan-600/60 dark:text-cyan-300/50">
                    AI VISION ACTIVE
                  </span>
                </div>
                <div className="mt-3 grid gap-4">
                  {/* ── Cinematic Drone HUD ── */}
                  <DroneHUD
                    personDetected={personDetected}
                    screamDetected={screamDetected}
                    personConfidence={personConfidence}
                    threat={decisionState.threat}
                    opState={opState}
                    metrics={metrics}
                    aiEnabled={aiEnabled}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard icon={Radar}      title="Tracking Nodes" value="08"                  accent="cyan" />
                    <MetricCard icon={Bot}        title="AI Processes"   value="03"                  accent="violet" />
                    <MetricCard
                      icon={ShieldCheck}
                      title="Safety Status"
                      value={decisionState.threat}
                      accent={decisionState.threat === "HIGH" ? "rose" : decisionState.threat === "MEDIUM" ? "amber" : "emerald"}
                    />
                  </div>
                </div>
              </GlassCard>

              <SnapshotPanel snapshot={snapshots[0]} />
              <MapPanel
                dronePosition={dronePosition}
                targetPosition={targetPosition}
                targetVisible={personDetected}
                threat={decisionState.threat}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <GlassCard glow="purple">
                  <SectionLabel label="Evidence Queue" />
                  <p className="mt-4 text-sm leading-7 text-slate-600 transition-all duration-300 dark:text-slate-300">
                    The snapshot subsystem keeps the newest three alert captures ready for review and handoff.
                  </p>
                  <div className="mt-5 space-y-3">
                    {snapshots.length ? (
                      snapshots.map((snapshot, index) => (
                        <CompactSignal
                          key={`${snapshot.timestamp}-${index}`}
                          icon={Radar}
                          label={index === 0 ? "Latest Capture" : `Archive ${index}`}
                          value={`${snapshot.timestamp} · ${snapshot.label} ${snapshot.confidence.toFixed(2)}`}
                          accent={index === 0 ? "rose" : "violet"}
                        />
                      ))
                    ) : (
                      <CompactSignal
                        icon={Radar}
                        label="Capture Buffer"
                        value="Awaiting first alert snapshot"
                        accent="emerald"
                      />
                    )}
                  </div>
                </GlassCard>

                <div className="grid gap-4">
                  <GlassCard glow="green">
                    <SectionLabel label="Autonomous Actions" />
                    <div className="mt-4 space-y-3">
                      <CompactSignal
                        icon={UserRound}
                        label="Visual Input"
                        value={personDetected ? `Person ${personConfidence.toFixed(2)}` : "No target"}
                        accent="cyan"
                      />
                      <CompactSignal
                        icon={Siren}
                        label="Audio Input"
                        value={screamDetected ? `Scream ${screamConfidence.toFixed(2)}` : "Normal"}
                        accent={screamDetected ? "amber" : "emerald"}
                      />
                      <CompactSignal
                        icon={Activity}
                        label="Engine Action"
                        value={decisionState.decision}
                        accent={decisionState.threat === "HIGH" ? "rose" : decisionState.threat === "MEDIUM" ? "amber" : "emerald"}
                      />
                    </div>
                  </GlassCard>
                  <GlassCard glow="cyan">
                    <SectionLabel label="Operator Notes" />
                    <p className="mt-4 text-sm leading-7 text-slate-600 transition-all duration-300 dark:text-slate-300">
                      Reserve this space for mission annotations, handoff notes, and rapid analyst review.
                    </p>
                  </GlassCard>
                </div>
              </div>
            </section>

            <section className="grid gap-4 self-start">
              <SectionBlock
                eyebrow="AI Analysis"
                title="Decision flow and event reasoning"
                detail="Compact intelligence stack for fast reading of why the system is reacting."
              />

              <DecisionPanel
                decision={decisionState.decision}
                threat={decisionState.threat}
                reason={decisionState.reason}
                personDetected={personDetected}
                screamDetected={screamDetected}
              />
              <EventTimeline events={events} />
              <MetricsPanel metrics={metrics} aiEnabled={aiEnabled} compact />
              <GlassCard glow="purple">
                <SectionLabel label="Threat Matrix" />
                <p className="mt-4 text-sm leading-7 text-slate-600 transition-all duration-300 dark:text-slate-300">
                  Mock regional escalation view. Use this space later for geofenced alerts, threat clusters, and response zones.
                </p>
              </GlassCard>
              <GlassCard glow="purple">
                <SectionLabel label="Live Intelligence" />
                <div className="mt-4 space-y-4">
                  <InfoTile
                    title="Target Classification"
                    description={
                      personDetected
                        ? `Person detected with confidence ${personConfidence.toFixed(2)}. Visual tracker is locked and publishing updates.`
                        : "No person currently detected. Visual stream remains in passive watch mode."
                    }
                  />
                  <InfoTile
                    title="Audio Threat Signal"
                    description={
                      screamDetected
                        ? `Scream signature elevated at ${screamConfidence.toFixed(2)} confidence. Audio alert is feeding the decision engine.`
                        : "Audio channel is stable with no elevated scream confidence at the moment."
                    }
                  />
                  <InfoTile
                    title="System Diagnostics"
                    description={`Decision engine state: ${decisionState.decision}. Threat posture is ${decisionState.threat}.`}
                  />
                </div>
              </GlassCard>
            </section>

            <aside className="grid gap-4 self-start xl:sticky xl:top-28">
              <SectionBlock
                eyebrow="System Status"
                title="Controls and live operational health"
                detail="Slim operator rail for status, audio, and quick control without crowding the analysis view."
              />

              <div className="xl:hidden">
                <details className="rounded-[28px] border border-slate-200/70 bg-white/60 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045]">
                  <summary className="cursor-pointer list-none text-sm font-medium text-slate-900 dark:text-white">
                    Open system toolbar
                  </summary>
                  <div className="mt-4 grid gap-4">
                    <SystemToolbar
                      systemStatuses={systemStatuses}
                      soundEnabled={soundEnabled}
                      setSoundEnabled={setSoundEnabled}
                      alertMode={alertMode}
                      aiEnabled={aiEnabled}
                      setAiEnabled={setAiEnabled}
                      sensitivity={sensitivity}
                      setSensitivity={setSensitivity}
                      threshold={threshold}
                      setThreshold={setThreshold}
                      personDetected={personDetected}
                      screamDetected={screamDetected}
                      decisionState={decisionState}
                    />
                  </div>
                </details>
              </div>

              <div className="hidden xl:grid xl:gap-4">
                <SystemToolbar
                  systemStatuses={systemStatuses}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  alertMode={alertMode}
                  aiEnabled={aiEnabled}
                  setAiEnabled={setAiEnabled}
                  sensitivity={sensitivity}
                  setSensitivity={setSensitivity}
                  threshold={threshold}
                  setThreshold={setThreshold}
                  personDetected={personDetected}
                  screamDetected={screamDetected}
                  decisionState={decisionState}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function SystemToolbar({
  systemStatuses,
  soundEnabled,
  setSoundEnabled,
  alertMode,
  aiEnabled,
  setAiEnabled,
  sensitivity,
  setSensitivity,
  threshold,
  setThreshold,
  personDetected,
  screamDetected,
  decisionState,
}) {
  return (
    <>
      <SystemStatus statuses={systemStatuses} compact />
      <SoundControl
        soundEnabled={soundEnabled}
        onToggle={() => setSoundEnabled((current) => !current)}
        alertMode={alertMode}
        compact
      />
      <ControlPanel
        aiEnabled={aiEnabled}
        onToggleAi={() => setAiEnabled((current) => !current)}
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
        threshold={threshold}
        onThresholdChange={setThreshold}
      />
      <GlassCard glow="green">
        <SectionLabel label="Quick Indicators" />
        <div className="mt-4 space-y-3">
          <CompactSignal
            icon={UserRound}
            label="Vision"
            value={personDetected ? "Tracking target" : "No target"}
            accent={personDetected ? "cyan" : "emerald"}
          />
          <CompactSignal
            icon={Siren}
            label="Audio"
            value={screamDetected ? "Threat signal" : "Normal"}
            accent={screamDetected ? "amber" : "emerald"}
          />
          <CompactSignal
            icon={Activity}
            label="Decision"
            value={decisionState.decision}
            accent={decisionState.threat === "HIGH" ? "rose" : decisionState.threat === "MEDIUM" ? "amber" : "emerald"}
          />
        </div>
      </GlassCard>
    </>
  );
}

function SectionBlock({ eyebrow, title, detail }) {
  return (
    <div className="rounded-[24px] border border-slate-200/60 bg-white/42 px-5 py-4 backdrop-blur-xl transition-all duration-300 dark:border-white/8 dark:bg-white/[0.025]">
      <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">
        {detail}
      </p>
    </div>
  );
}

function GlassCard({ children, className = "", glow = "cyan" }) {
  const glowClass =
    glow === "purple"
      ? "hover:shadow-[0_22px_64px_rgba(124,58,237,0.12)] dark:hover:shadow-[0_22px_64px_rgba(124,58,237,0.09)]"
      : glow === "green"
        ? "hover:shadow-[0_22px_64px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_22px_64px_rgba(0,255,156,0.08)]"
        : "hover:shadow-[0_22px_64px_rgba(14,165,233,0.12)] dark:hover:shadow-[0_22px_64px_rgba(0,245,255,0.08)]";

  return (
    <div
      className={[
        "rounded-[28px] border border-slate-200/70 bg-white/60 p-5 backdrop-blur-2xl shadow-[0_22px_70px_rgba(14,165,233,0.08)] transition-all duration-300 ease-out hover:scale-[1.015] hover:border-cyan-400/20 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_22px_70px_rgba(0,0,0,0.35)]",
        glowClass,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-600/80 transition-all duration-300 dark:text-cyan-300/75">
      {label}
    </p>
  );
}

function MetricCard({ icon: Icon, title, value, accent }) {
  const accentClass =
    accent === "rose"
      ? "border-rose-400/20 bg-rose-500/8 text-rose-600 dark:text-rose-200"
      : accent === "amber"
        ? "border-amber-400/20 bg-amber-400/8 text-amber-600 dark:text-amber-200"
        : accent === "violet"
      ? "border-violet-400/20 bg-violet-500/8 text-violet-600 dark:text-violet-200"
      : accent === "emerald"
        ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-600 dark:text-emerald-200"
        : "border-cyan-400/20 bg-cyan-400/8 text-cyan-600 dark:text-cyan-200";

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 ease-out hover:scale-[1.02] dark:border-white/10 dark:bg-black/20">
      <div className={`inline-flex rounded-2xl border px-3 py-3 ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 transition-all duration-300 dark:text-white">{value}</p>
    </div>
  );
}

function InfoTile({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 ease-out hover:scale-[1.01] hover:border-violet-400/25 hover:bg-violet-500/5 dark:border-white/10 dark:bg-black/20">
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,245,255,0.8)]" />
        <p className="text-sm font-medium text-slate-900 transition-all duration-300 dark:text-white">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 transition-all duration-300 dark:text-slate-300">{description}</p>
    </div>
  );
}

function CompactSignal({ icon: Icon, label, value, accent = "cyan" }) {
  const accentClass =
    accent === "rose"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-200"
      : accent === "amber"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-200"
        : accent === "violet"
          ? "border-violet-400/20 bg-violet-400/10 text-violet-600 dark:text-violet-200"
        : accent === "emerald"
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-600 dark:text-emerald-200"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200";

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 transition-all duration-300 dark:border-white/10 dark:bg-black/20">
      <div className="flex items-center gap-3">
        <div className={["inline-flex rounded-2xl border p-3 transition-all duration-300", accentClass].join(" ")}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-slate-500 transition-all duration-300 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-medium text-slate-900 transition-all duration-300 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function resolveDecision(personDetected, screamDetected) {
  if (personDetected && screamDetected) {
    return {
      decision: "HIGH ALERT",
      threat: "HIGH",
      reason: "Person detected + scream detected",
    };
  }

  if (screamDetected) {
    return {
      decision: "SCAN MODE",
      threat: "MEDIUM",
      reason: "Scream detected without a locked person track",
    };
  }

  if (personDetected) {
    return {
      decision: "TRACK MODE",
      threat: "LOW",
      reason: "Person detected while audio remains stable",
    };
  }

  return {
    decision: "IDLE",
    threat: "NONE",
    reason: "No person or scream signal is active",
  };
}

function getScenario(step, sensitivity, threshold) {
  const sensitivityFactor = sensitivity / 100;
  const personWave = (Math.sin(step / (2.1 - sensitivityFactor * 0.7)) + 1) / 2;
  const screamWave = (Math.cos(step / (3.4 - sensitivityFactor * 0.9) + 0.8) + 1) / 2;
  const confidenceLift = sensitivityFactor * 0.26;

  const rawPersonConfidence = clamp(0.08 + personWave * 0.62 + confidenceLift + Math.random() * 0.08, 0.08, 0.97);
  const rawScreamConfidence = clamp(0.05 + screamWave * 0.58 + confidenceLift * 0.9 + Math.random() * 0.08, 0.05, 0.96);

  const personDetected = rawPersonConfidence >= threshold;
  const screamDetected = rawScreamConfidence >= threshold;

  return {
    personDetected,
    screamDetected,
    personConfidence: Number(rawPersonConfidence.toFixed(2)),
    screamConfidence: Number(rawScreamConfidence.toFixed(2)),
    targetPosition: {
      lat: Number((23.8103 + Math.sin(step / 2.8) * 0.0014 + Math.random() * 0.00018).toFixed(4)),
      lng: Number((90.4125 + Math.cos(step / 3.3) * 0.0012 + Math.random() * 0.00018).toFixed(4)),
    },
  };
}

function createInitialEvents() {
  return [
    createEvent("detection", "10:32:01", "Person detected (0.82)"),
    createEvent("scream", "10:32:03", "Scream detected (0.67)"),
    createEvent("alert", "10:32:04", "ALERT triggered"),
  ];
}

function createEvent(type, timestamp, message) {
  return {
    id: `${timestamp}-${type}-${message}`,
    type,
    timestamp,
    message,
  };
}

function formatTimelineTime(step) {
  const baseHour = 10;
  const baseMinute = 32;
  const baseSecond = 1 + step * 3;
  const minute = baseMinute + Math.floor(baseSecond / 60);
  const second = baseSecond % 60;

  return `${String(baseHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function playAlertTone(audioRef) {
  if (!audioRef.current) {
    return;
  }

  audioRef.current.pause();
  audioRef.current.currentTime = 0;
  audioRef.current.play().catch(() => {});
}

function clearRepeatTimeouts(repeatTimeoutsRef) {
  repeatTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
  repeatTimeoutsRef.current = [];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createSnapshot({ timestamp, confidence, label, threat }) {
  return {
    timestamp,
    confidence,
    label,
    threat,
    image: buildSnapshotImage({ timestamp, confidence, label }),
  };
}

function buildSnapshotImage({ timestamp, confidence, label }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07111f"/>
          <stop offset="55%" stop-color="#0b1220"/>
          <stop offset="100%" stop-color="#140816"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)"/>
      <rect x="0" y="0" width="1280" height="720" fill="rgba(0,245,255,0.06)"/>
      <g opacity="0.28" stroke="#00f5ff">
        <path d="M0 160H1280M0 320H1280M0 480H1280M320 0V720M640 0V720M960 0V720"/>
      </g>
      <rect x="430" y="150" width="240" height="320" rx="24" fill="none" stroke="#00f5ff" stroke-width="5"/>
      <rect x="428" y="148" width="244" height="324" rx="26" fill="none" stroke="rgba(0,245,255,0.22)" stroke-width="18"/>
      <rect x="435" y="98" width="216" height="36" rx="18" fill="rgba(0,245,255,0.12)" stroke="rgba(0,245,255,0.5)"/>
      <text x="452" y="122" fill="#c8fbff" font-size="20" font-family="Arial, sans-serif">${label} ${confidence.toFixed(2)}</text>
      <text x="88" y="92" fill="#8ff3ff" font-size="22" font-family="Arial, sans-serif" letter-spacing="4">ALERT SNAPSHOT</text>
      <text x="88" y="632" fill="#cbd5e1" font-size="22" font-family="Arial, sans-serif">TIME ${timestamp}</text>
      <text x="88" y="668" fill="#fda4af" font-size="24" font-family="Arial, sans-serif">THREAT EVIDENCE CAPTURED</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default RealTime;

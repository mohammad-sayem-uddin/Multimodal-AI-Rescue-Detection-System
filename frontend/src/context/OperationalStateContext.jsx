import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

// Operational states
export const OPERATIONAL_STATES = [
  "IDLE",
  "MONITORING",
  "TRACKING",
  "ANALYZING",
  "ALERT",
  "CRITICAL"
];

const OperationalStateContext = createContext();

export function OperationalStateProvider({ children }) {
  const [state, setState] = useState("IDLE");
  const [aiMessage, setAIMessage] = useState("System initialized.");
  const [visionConfidence, setVisionConfidence] = useState(0.88);
  const [systemStability, setSystemStability] = useState("HIGH");

  // Rotating AI feedback messages
  const aiMessages = useMemo(() => ({
    IDLE: ["System standing by.", "Awaiting input..."],
    MONITORING: ["Monitoring environment...", "Sensors active."],
    TRACKING: ["Tracking target movement...", "HUD tracking engaged."],
    ANALYZING: ["Analyzing acoustic pattern...", "AI processing signals..."],
    ALERT: ["Alert: Possible threat detected!", "Escalating response..."],
    CRITICAL: ["Critical: Emergency protocol active!", "Deploying all resources..."]
  }), []);

  // Cycle AI message on state change
  const updateAIMessage = useCallback((newState) => {
    const msgs = aiMessages[newState] || ["System active."];
    setAIMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  }, [aiMessages]);

  const setOperationalState = useCallback((newState) => {
    setState(newState);
    updateAIMessage(newState);
  }, [updateAIMessage]);

  // Simulate live vision confidence and system stability
  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisionConfidence((v) => {
        let next = v + (Math.random() - 0.5) * 0.01;
        return Math.max(0.75, Math.min(0.99, Number(next.toFixed(2))));
      });
      setSystemStability((s) => {
        if (state === "CRITICAL") return "LOW";
        if (state === "ALERT") return "MEDIUM";
        return "HIGH";
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [state]);

  const value = useMemo(() => ({
    state,
    setOperationalState,
    aiMessage,
    visionConfidence,
    systemStability
  }), [state, setOperationalState, aiMessage, visionConfidence, systemStability]);

  return (
    <OperationalStateContext.Provider value={value}>
      {children}
    </OperationalStateContext.Provider>
  );
}

export function useOperationalState() {
  return useContext(OperationalStateContext);
}

import { create } from "zustand";

export const ALERT_STATES = {
  NORMAL: "NORMAL",
  TRACKING: "TRACKING",
  MEDIUM_ALERT: "MEDIUM_ALERT",
  HIGH_ALERT: "HIGH_ALERT",
};

const alertConfig = {
  NORMAL: {
    message: "System stable.",
    level: "LOW",
  },
  TRACKING: {
    message: "Tracking target.",
    level: "LOW",
  },
  MEDIUM_ALERT: {
    message: "Audio anomaly detected.",
    level: "MEDIUM",
  },
  HIGH_ALERT: {
    message: "Emergency signal confirmed!",
    level: "HIGH",
  },
};

export const useAlertState = create((set) => ({
  state: ALERT_STATES.NORMAL,
  message: alertConfig.NORMAL.message,
  level: alertConfig.NORMAL.level,
  timestamp: Date.now(),
  setAlert: (newState) =>
    set(() => ({
      state: newState,
      message: alertConfig[newState].message,
      level: alertConfig[newState].level,
      timestamp: Date.now(),
    })),
}));

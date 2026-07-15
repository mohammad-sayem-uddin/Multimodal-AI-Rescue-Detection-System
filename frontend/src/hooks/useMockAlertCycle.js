import { useEffect } from "react";
import { useAlertState, ALERT_STATES } from "../store/alertState";

// Simulate alert state changes for demo/testing
export default function useMockAlertCycle() {
  useEffect(() => {
    const states = [
      ALERT_STATES.NORMAL,
      ALERT_STATES.TRACKING,
      ALERT_STATES.MEDIUM_ALERT,
      ALERT_STATES.HIGH_ALERT,
    ];
    let idx = 0;
    const interval = setInterval(() => {
      useAlertState.getState().setAlert(states[idx]);
      idx = (idx + 1) % states.length;
    }, 8000);
    return () => clearInterval(interval);
  }, []);
}

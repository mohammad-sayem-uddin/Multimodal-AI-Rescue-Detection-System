import { useEffect, useRef, useState } from "react";
import { useAlertState } from "../store/alertState";

const toastStyles = {
  NORMAL: "border-cyan-200 bg-white/80 text-cyan-700",
  TRACKING: "border-cyan-300 bg-cyan-50/90 text-cyan-800",
  MEDIUM_ALERT: "border-amber-300 bg-amber-50/90 text-amber-700",
  HIGH_ALERT: "border-rose-400 bg-rose-50/90 text-rose-700",
};

export default function AlertToast() {
  const { state, message, timestamp } = useAlertState();
  const [visible, setVisible] = useState(false);
  const lastTimestamp = useRef(timestamp);

  useEffect(() => {
    if (timestamp !== lastTimestamp.current) {
      setVisible(true);
      lastTimestamp.current = timestamp;
      const timer = setTimeout(() => setVisible(false), 3200);
      return () => clearTimeout(timer);
    }
  }, [timestamp]);

  if (!visible) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 min-w-[200px] max-w-xs rounded-xl border px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-300 ${toastStyles[state]}`}
      style={{ pointerEvents: "auto" }}
      role="alert"
      aria-live="assertive"
    >
      <span className="block text-xs font-semibold tracking-wide">{message}</span>
    </div>
  );
}

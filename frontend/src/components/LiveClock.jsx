import { useEffect, useState } from "react";
import { useOperationalState } from "../context/OperationalStateContext";

function pad(num) {
  return num.toString().padStart(2, "0");
}

export default function LiveClock() {
  const [time, setTime] = useState(new Date());
  const { state } = useOperationalState();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, state === "IDLE" ? 2000 : 1000); // Slower tick in IDLE, faster in active states
    return () => clearInterval(interval);
  }, [state]);

  const hours = pad(time.getUTCHours());
  const minutes = pad(time.getUTCMinutes());
  const seconds = pad(time.getUTCSeconds());

  return (
    <span
      className={
        "ml-2 select-none font-mono text-xs tracking-widest opacity-80 " +
        (state === "CRITICAL"
          ? "text-rose-400 animate-pulse"
          : state === "ALERT"
          ? "text-amber-400 animate-pulse"
          : state === "TRACKING"
          ? "text-emerald-400"
          : state === "ANALYZING"
          ? "text-indigo-400"
          : state === "MONITORING"
          ? "text-blue-400"
          : "text-cyan-400/90 dark:text-cyan-300/80")
      }
      style={{ letterSpacing: "0.12em" }}
      title={`Live UTC Time | State: ${state}`}
    >
      {hours}:{minutes}:{seconds} UTC
    </span>
  );
}

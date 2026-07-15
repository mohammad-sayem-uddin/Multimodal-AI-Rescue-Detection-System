import { useOperationalState } from "../context/OperationalStateContext";

export default function AIThinkingIndicator() {
  const { aiMessage } = useOperationalState();
  return (
    <span className="ml-3 text-xs font-mono text-cyan-400/80 dark:text-cyan-300/70 animate-ai-thinking select-none">
      {aiMessage}
    </span>
  );
}

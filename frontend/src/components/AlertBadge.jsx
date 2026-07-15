import { useAlertState } from '../store/alertState';

const badgeStyles = {
  NORMAL: 'border-cyan-300 bg-cyan-50 text-cyan-700',
  TRACKING: 'border-cyan-400 bg-cyan-100 text-cyan-800',
  MEDIUM_ALERT: 'border-amber-300 bg-amber-50 text-amber-700',
  HIGH_ALERT: 'border-rose-400 bg-rose-50 text-rose-700',
};

export default function AlertBadge() {
  const { state } = useAlertState();
  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest shadow-sm transition-all duration-300 ${badgeStyles[state]}`}
      style={{ letterSpacing: '0.13em', minWidth: 90, justifyContent: 'center' }}
      aria-live="polite"
    >
      AI STATUS: {state.replace('_', ' ')}
    </span>
  );
}

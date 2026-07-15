import React from "react";

/**
 * GlassSkeleton
 * Glassmorphism-inspired loading skeleton.
 * Replaces blank loading areas with an operational shimmer placeholder.
 *
 * Props:
 *   className  – additional Tailwind classes
 *   height     – pixel height (number) or CSS string
 *   radius     – border-radius CSS value
 *   style      – extra inline styles
 *   label      – optional aria-label for screen readers
 */
export default function GlassSkeleton({
  className = "",
  style      = {},
  height     = 48,
  radius     = "var(--radius-card)",
  label      = "Loading...",
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`glass-skeleton ${className}`}
      style={{ height, borderRadius: radius, ...style }}
    >
      {/* Inner shimmer streak */}
      <div className="glass-skeleton__streak" />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * PageTransition
 * Wraps page content and applies a smooth fade + subtle upward slide
 * whenever the route changes. Stays out of the way — no blocking.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [key, setKey] = useState(location.pathname);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;

    // 1. Fade out
    setVisible(false);

    const swapTimer = setTimeout(() => {
      // 2. Swap content
      setKey(location.pathname);
      prevPath.current = location.pathname;

      // 3. Fade in (next frame)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, 160); // matches CSS transition duration

    return () => clearTimeout(swapTimer);
  }, [location.pathname]);

  return (
    <div
      key={key}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

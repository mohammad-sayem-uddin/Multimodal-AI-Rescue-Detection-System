import { useState } from "react";

function InteractivePanel({
  children,
  className = "",
  glow = "cyan",
  maxTilt = 7,
  scale = 1.028,
}) {
  const [transformStyle, setTransformStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;

    const rotateY = (offsetX - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - offsetY) * maxTilt * 2;

    setTransformStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  return (
    <div className="panel-perspective">
      <div
        className={[
          "panel-tilt transition-all duration-300 ease-out will-change-transform",
          glow === "purple" ? "neon-glow-purple" : glow === "green" ? "neon-glow-green" : "neon-glow-cyan",
          className,
        ].join(" ")}
        style={transformStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
}

export default InteractivePanel;

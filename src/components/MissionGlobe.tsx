import { useRef, useState } from "react";

import earthOrbit from "@/assets/earth-orbit.jpg";

export function MissionGlobe({ compact = false }: { compact?: boolean }) {
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  return (
    <div
      className={`globe-stage ${compact ? "globe-stage-compact" : ""}`}
      aria-label="Interactive rotating view of Earth"
      onPointerDown={(event) => {
        startX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (startX.current === null) return;
        setOffset((current) => current + (event.clientX - (startX.current ?? event.clientX)) * 0.35);
        startX.current = event.clientX;
      }}
      onPointerUp={() => {
        startX.current = null;
      }}
    >
      <div className="globe-orbit globe-orbit-one" />
      <div className="globe-orbit globe-orbit-two" />
      <div
        className="globe-sphere"
        style={{ "--globe-offset": `${offset}px`, backgroundImage: `url(${earthOrbit})` } as React.CSSProperties}
      >
        <div className="globe-grid" />
        <div className="globe-shade" />
      </div>
      <span className="globe-satellite" />
    </div>
  );
}
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Planet Ponzi Saga — puzzle spatial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Étoile 5 branches (SVG simplifié pour @vercel/og / Satori). */
function StarSvg({
  sizePx,
  fill,
  x,
  y,
  rotate = 0,
}: {
  sizePx: number;
  fill: string;
  x: number;
  y: number;
  rotate?: number;
}) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(4px 6px 0 rgba(15, 23, 42, 0.25))",
      }}
    >
      <path
        fill={fill}
        d="M50 4 L62 38 L98 38 L70 60 L80 96 L50 74 L20 96 L30 60 L2 38 L38 38 Z"
      />
    </svg>
  );
}

/** Petite « brique » de jeu (3 faces). */
function BrickSvg({ x, y }: { x: number; y: number }) {
  return (
    <svg
      width={140}
      height={120}
      viewBox="0 0 140 120"
      style={{
        position: "absolute",
        left: x,
        top: y,
        filter: "drop-shadow(6px 10px 0 rgba(15, 23, 42, 0.2))",
      }}
    >
      <path fill="#fbbf24" d="M10 40 L70 10 L130 40 L130 85 L70 115 L10 85 Z" />
      <path fill="#f59e0b" d="M10 40 L70 10 L70 115 L10 85 Z" />
      <path fill="#fcd34d" d="M70 10 L130 40 L130 85 L70 115 Z" />
    </svg>
  );
}

/** Logo stylisé (planète + anneau). */
function LogoSvg({ x, y }: { x: number; y: number }) {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      style={{
        position: "absolute",
        left: x,
        top: y,
        filter: "drop-shadow(5px 8px 0 rgba(15, 23, 42, 0.22))",
      }}
    >
      <rect x="8" y="8" width="104" height="104" rx="24" fill="#f6f7ff" />
      <circle cx="60" cy="60" r="28" fill="#7c3aed" />
      <circle cx="60" cy="60" r="12" fill="#fbbf24" />
      <path
        d="M20 72 Q60 48 100 72"
        stroke="#38bdf8"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "linear-gradient(135deg, #7c3aed 0%, #6d28d9 18%, #4f46e5 42%, #0ea5e9 72%, #7dd3fc 100%)",
        }}
      >
        {/* Grain léger (bandes très subtiles). */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(125deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 14px)",
            opacity: 0.5,
          }}
        />

        <StarSvg sizePx={100} fill="#fef08a" x={72} y={56} rotate={-12} />
        <StarSvg sizePx={72} fill="#fde047" x={1020} y={420} rotate={18} />
        <BrickSvg x={880} y={100} />
        <LogoSvg x={80} y={400} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 80px",
            maxWidth: 1000,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#ffffff",
              fontFamily:
                'ui-rounded, system-ui, "Segoe UI", "Apple SD Gothic Neo", sans-serif',
              textShadow:
                "0 4px 0 #4c1d95, 0 8px 0 #312e81, 0 12px 0 rgba(15,23,42,0.35), 0 16px 28px rgba(0,0,0,0.25)",
            }}
          >
            Planet Ponzi Saga
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 34,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              lineHeight: 1.35,
              fontFamily: 'system-ui, "Segoe UI", sans-serif',
              textShadow: "0 2px 12px rgba(15,23,42,0.35)",
            }}
          >
            Le puzzle spatial addictif. Bâtissez, optimisez, progressez !
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

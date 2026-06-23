"use client";

interface JarProgressProps {
  /** Amount actually spent */
  spent: number;
  /** Budget limit; null = no limit set */
  limit: number | null;
  /** Emoji shown inside the jar */
  emoji?: string;
  /** Category colour for tinted label */
  color?: string;
  /** Label below the jar */
  label: string;
  /** Formatted spend string (already currency-formatted by caller) */
  spentFormatted: string;
  limitFormatted?: string;
  size?: number;
}

function fillColor(pct: number) {
  if (pct >= 1) return "var(--cherry)";
  if (pct >= 0.8) return "var(--lemon)";
  return "var(--lime)";
}

function safeId(v: string) { return v.replace(/[^a-zA-Z0-9_-]/g, "-"); }

export default function JarProgress({
  spent,
  limit,
  emoji = "🪣",
  label,
  spentFormatted,
  limitFormatted,
  size = 72,
}: JarProgressProps) {
  const rawPct = limit && limit > 0 ? spent / limit : 0;
  const pct = Math.min(rawPct, 1);
  const pctLabel = `${Math.round(rawPct * 100)}%`;
  const clipId = `jar-clip-${safeId(label)}`;
  const isOverall = label === "Overall";
  const hasLimit = limit !== null && limit > 0;
  const fill = hasLimit ? fillColor(pct) : "var(--grape)";

  // Wave path: the liquid fill occupies the bottom `pct` of the jar's inner area.
  // We draw an SVG jar silhouette and animate a wavy fill.
  const w = size;
  const h = size;
  const jarTop = h * 0.12;
  const jarBot = h * 0.94;
  const jarHeight = jarBot - jarTop;
  const fillY = jarBot - jarHeight * pct;
  const waveAmp = 3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: isOverall ? "8px" : "6px",
        width: isOverall ? size + 190 : size + 16,
      }}
    >
      <div style={{ position: "relative", width: w, height: h }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
          <defs>
            <clipPath id={clipId}>
              {/* Jar silhouette clip: rounded rect with a narrow neck */}
              <path
                d={`
                  M${w * 0.3} ${jarTop}
                  L${w * 0.7} ${jarTop}
                  Q${w * 0.75} ${h * 0.18} ${w * 0.78} ${h * 0.28}
                  Q${w * 0.86} ${h * 0.35} ${w * 0.86} ${h * 0.5}
                  L${w * 0.86} ${jarBot - 8}
                  Q${w * 0.86} ${jarBot} ${w * 0.78} ${jarBot}
                  L${w * 0.22} ${jarBot}
                  Q${w * 0.14} ${jarBot} ${w * 0.14} ${jarBot - 8}
                  L${w * 0.14} ${h * 0.5}
                  Q${w * 0.14} ${h * 0.35} ${w * 0.22} ${h * 0.28}
                  Q${w * 0.25} ${h * 0.18} ${w * 0.3} ${jarTop}
                  Z
                `}
              />
            </clipPath>
          </defs>

          {/* Jar background */}
          <path
            d={`
              M${w * 0.3} ${jarTop}
              L${w * 0.7} ${jarTop}
              Q${w * 0.75} ${h * 0.18} ${w * 0.78} ${h * 0.28}
              Q${w * 0.86} ${h * 0.35} ${w * 0.86} ${h * 0.5}
              L${w * 0.86} ${jarBot - 8}
              Q${w * 0.86} ${jarBot} ${w * 0.78} ${jarBot}
              L${w * 0.22} ${jarBot}
              Q${w * 0.14} ${jarBot} ${w * 0.14} ${jarBot - 8}
              L${w * 0.14} ${h * 0.5}
              Q${w * 0.14} ${h * 0.35} ${w * 0.22} ${h * 0.28}
              Q${w * 0.25} ${h * 0.18} ${w * 0.3} ${jarTop}
              Z
            `}
            fill="var(--smoke)"
          />

          {/* Liquid fill with wave */}
          {pct > 0 && (
            <g clipPath={`url(#${clipId})`}>
              <path
                d={`
                  M${w * 0.14} ${jarBot}
                  L${w * 0.14} ${fillY}
                  Q${w * 0.28} ${fillY - waveAmp} ${w * 0.42} ${fillY}
                  Q${w * 0.56} ${fillY + waveAmp} ${w * 0.7} ${fillY}
                  Q${w * 0.78} ${fillY - waveAmp / 2} ${w * 0.86} ${fillY}
                  L${w * 0.86} ${jarBot}
                  Z
                `}
                fill={fill}
                opacity={0.9}
              >
                {hasLimit && (
                  <animate
                    attributeName="d"
                    dur="2.5s"
                    repeatCount="indefinite"
                    values={`
                      M${w * 0.14} ${jarBot} L${w * 0.14} ${fillY} Q${w * 0.28} ${fillY - waveAmp} ${w * 0.42} ${fillY} Q${w * 0.56} ${fillY + waveAmp} ${w * 0.7} ${fillY} Q${w * 0.78} ${fillY - waveAmp / 2} ${w * 0.86} ${fillY} L${w * 0.86} ${jarBot} Z;
                      M${w * 0.14} ${jarBot} L${w * 0.14} ${fillY} Q${w * 0.28} ${fillY + waveAmp} ${w * 0.42} ${fillY} Q${w * 0.56} ${fillY - waveAmp} ${w * 0.7} ${fillY} Q${w * 0.78} ${fillY + waveAmp / 2} ${w * 0.86} ${fillY} L${w * 0.86} ${jarBot} Z;
                      M${w * 0.14} ${jarBot} L${w * 0.14} ${fillY} Q${w * 0.28} ${fillY - waveAmp} ${w * 0.42} ${fillY} Q${w * 0.56} ${fillY + waveAmp} ${w * 0.7} ${fillY} Q${w * 0.78} ${fillY - waveAmp / 2} ${w * 0.86} ${fillY} L${w * 0.86} ${jarBot} Z
                    `}
                  />
                )}
              </path>
            </g>
          )}

          {/* Jar outline */}
          <path
            d={`
              M${w * 0.3} ${jarTop}
              L${w * 0.7} ${jarTop}
              Q${w * 0.75} ${h * 0.18} ${w * 0.78} ${h * 0.28}
              Q${w * 0.86} ${h * 0.35} ${w * 0.86} ${h * 0.5}
              L${w * 0.86} ${jarBot - 8}
              Q${w * 0.86} ${jarBot} ${w * 0.78} ${jarBot}
              L${w * 0.22} ${jarBot}
              Q${w * 0.14} ${jarBot} ${w * 0.14} ${jarBot - 8}
              L${w * 0.14} ${h * 0.5}
              Q${w * 0.14} ${h * 0.35} ${w * 0.22} ${h * 0.28}
              Q${w * 0.25} ${h * 0.18} ${w * 0.3} ${jarTop}
              Z
            `}
            fill="none"
            stroke="var(--plum)"
            strokeWidth="1.5"
            opacity={0.15}
          />

          {/* Jar lid */}
          <rect
            x={w * 0.28}
            y={jarTop - h * 0.07}
            width={w * 0.44}
            height={h * 0.09}
            rx={3}
            fill="var(--plum)"
            opacity={0.12}
          />
        </svg>

        {/* Emoji overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "12px",
            fontSize: size * 0.3,
            lineHeight: 1,
            pointerEvents: "none",
          }}
        >
          {label === "Overall" ? pctLabel : emoji}
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--plum)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: size + 8,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "0.68rem", color: hasLimit ? fill : "var(--muted)", fontWeight: 600 }}>
          {spentFormatted}
          {hasLimit && limitFormatted && (
            <span style={{ color: "var(--muted)", fontWeight: 400 }}> / {limitFormatted}</span>
          )}
        </div>
      </div>
    </div>
  );
}

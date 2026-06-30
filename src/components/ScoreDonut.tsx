"use client";

import { useState } from "react";

export interface DonutSegment {
  label: string;
  raw: string; // human value e.g. "93%"
  normalized: number; // 0..1 contribution within its third
  color: string;
}

const CX = 90;
const CY = 90;
const R_OUT = 80;
const R_IN = 56;

function polar(angle: number, r: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function arc(start: number, end: number, rOut: number, rIn: number) {
  const p1 = polar(start, rOut);
  const p2 = polar(end, rOut);
  const p3 = polar(end, rIn);
  const p4 = polar(start, rIn);
  const large = end - start > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

// Interactive donut: the score sits in the centre; each segment is one
// component's contribution. Hovering a segment shows its detail.
export function ScoreDonut({ score, segments }: { score: number; segments: DonutSegment[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const slice = 360 / segments.length;
  const gap = 3;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0">
        {segments.map((seg, i) => {
          const base = i * slice;
          return (
            <g key={seg.label}>
              <path d={arc(base + gap, base + slice - gap, R_OUT, R_IN)} fill="#eef1f5" />
              <path
                d={arc(base + gap, base + gap + (slice - 2 * gap) * Math.max(0.02, seg.normalized), R_OUT, R_IN)}
                fill={seg.color}
                opacity={hover === null || hover === i ? 1 : 0.4}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                style={{ cursor: "pointer", transition: "opacity .15s" }}
              />
            </g>
          );
        })}
        <text x={CX} y={CY - 4} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 30, fontWeight: 600 }}>
          {score}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 11 }}>
          / 100
        </text>
      </svg>

      <ul className="space-y-1.5 text-sm">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={`flex items-center gap-2 rounded-md px-1.5 py-0.5 ${hover === i ? "bg-slate-50" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((h) => (h === i ? null : h))}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-slate-600">{seg.label}</span>
            <span className="ml-auto font-medium text-slate-900">{seg.raw}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

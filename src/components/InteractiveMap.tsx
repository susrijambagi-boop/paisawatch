"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/format";

export interface MapMarker {
  slug: string;
  stateName: string;
  sector: string;
  amount: number;
  x: number;
  y: number;
  r: number;
  hex: string;
}

export interface MapStatePath {
  name: string;
  d: string;
}

// Clickable, hoverable India map. Geometry is computed on the server and passed
// in; this component adds the interactivity (tooltip + drill-in + animation).
export function InteractiveMap({
  width,
  height,
  states,
  markers,
}: {
  width: number;
  height: number;
  states: MapStatePath[];
  markers: MapMarker[];
}) {
  const router = useRouter();
  const [hover, setHover] = useState<MapMarker | null>(null);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-slate-200">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Interactive map of India showing MPLADS spending by state"
      >
        <g>
          {states.map((s) => (
            <path key={s.name} d={s.d} fill="#eef1f5" stroke="#ffffff" strokeWidth={0.75}>
              <title>{s.name}</title>
            </path>
          ))}
        </g>
        <g>
          {markers.map((m, i) => (
            <circle
              key={`${m.slug}-${m.sector}`}
              className="mk-pop cursor-pointer"
              style={{ animationDelay: `${Math.min(i * 12, 600)}ms` }}
              cx={m.x}
              cy={m.y}
              r={hover === m ? m.r + 3 : m.r}
              fill={m.hex}
              fillOpacity={hover === m ? 0.8 : 0.55}
              stroke={m.hex}
              strokeWidth={hover === m ? 2 : 1}
              onMouseEnter={() => setHover(m)}
              onMouseLeave={() => setHover((h) => (h === m ? null : h))}
              onClick={() => router.push(`/mp/${m.slug}`)}
            />
          ))}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{
            left: `${(hover.x / width) * 100}%`,
            top: `${(hover.y / height) * 100}%`,
          }}
        >
          <div className="font-semibold">{hover.stateName}</div>
          <div className="text-slate-300">
            {hover.sector} · {formatINR(hover.amount)}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">Click to open →</div>
        </div>
      )}
    </div>
  );
}

import { getConstituencyShape } from "@/lib/constituency-geo";
import { Icon } from "./Icon";

// Draws the MP's parliamentary constituency boundary on their profile.
export function ConstituencyMap({ constituency }: { constituency: string }) {
  const shape = getConstituencyShape(constituency);
  if (!shape) return null;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon name="map-2" className="text-emerald-600" /> Constituency · {shape.name}
        <span className="text-xs font-normal text-slate-400">{shape.state}</span>
      </div>
      <svg
        viewBox={`0 0 ${shape.width} ${shape.height}`}
        className="mx-auto h-48 w-auto"
        role="img"
        aria-label={`Boundary of ${shape.name} parliamentary constituency`}
      >
        <path d={shape.d} fill="#d1fae5" stroke="#059669" strokeWidth={1} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

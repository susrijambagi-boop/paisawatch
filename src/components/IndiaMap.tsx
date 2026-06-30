import { projectIndia } from "@/lib/india-geo";
import { riskStyle } from "@/lib/ui";
import { CATEGORIES } from "@/lib/constants";
import type { ExpenditureWithMp } from "@/lib/types";
import { InteractiveMap, type MapMarker } from "./InteractiveMap";

// Server component: projects each expenditure to SVG coordinates, then hands a
// slim serializable payload to the interactive client map.
export function IndiaMap({ items }: { items: ExpenditureWithMp[] }) {
  const { width, height, states, markers } = projectIndia(items);
  const maxAmount = Math.max(1, ...markers.map((m) => m.data.amount));

  const radius = (amount: number): number => {
    const MIN = 4;
    const MAX = 22;
    return Math.round((MIN + Math.sqrt(amount / maxAmount) * (MAX - MIN)) * 10) / 10;
  };

  const mapped: MapMarker[] = markers
    .slice()
    .sort((a, b) => b.data.amount - a.data.amount)
    .map((m) => ({
      slug: m.data.mp.slug,
      stateName: m.data.mp.name,
      sector: CATEGORIES[m.data.category].label,
      amount: m.data.amount,
      x: Math.round(m.x * 10) / 10,
      y: Math.round(m.y * 10) / 10,
      r: radius(m.data.amount),
      hex: riskStyle(m.data.risk).hex,
    }));

  return (
    <InteractiveMap width={width} height={height} states={states} markers={mapped} />
  );
}

import "server-only";
import { geoMercator, geoPath } from "d3-geo";
import type { Geometry } from "geojson";
import pcData from "@/data/india-pc.json";

// Renders a single parliamentary constituency outline to an SVG path. Loaded
// once server-side; only the resulting path string reaches the client.

interface SlimFeature {
  n: string; // pc_name
  s: string; // state
  g: Geometry;
}

const features = (pcData as { features: SlimFeature[] }).features;

const norm = (s: string) =>
  s.replace(/\([^)]*\)/g, "").replace(/[^a-z]/gi, " ").trim().toUpperCase().replace(/\s+/g, " ");

const byName = new Map<string, SlimFeature>();
for (const f of features) byName.set(norm(f.n), f);

export interface ConstituencyShape {
  name: string;
  state: string;
  d: string;
  width: number;
  height: number;
}

export function getConstituencyShape(constituency: string): ConstituencyShape | null {
  const feature = byName.get(norm(constituency));
  if (!feature) return null;

  const W = 320;
  const H = 320;
  const geo = { type: "Feature" as const, properties: {}, geometry: feature.g };
  const projection = geoMercator().fitSize([W, H], geo);
  const d = geoPath(projection)(geo);
  if (!d) return null;
  return { name: feature.n, state: feature.s, d, width: W, height: H };
}

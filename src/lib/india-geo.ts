import "server-only";
import { geoMercator, geoPath } from "d3-geo";
import { merge } from "topojson-client";
import type {
  Topology,
  GeometryCollection,
  Polygon as TopoPolygon,
  MultiPolygon as TopoMultiPolygon,
} from "topojson-specification";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";
import topoData from "@/data/india-districts-topo.json";

type AreaGeometry = TopoPolygon | TopoMultiPolygon;

// Builds India's state outlines from a district-level topology and projects
// both the states and any (lat,lng) markers into SVG coordinates. Everything
// runs on the server, only the resulting path strings and x/y points are sent
// to the client, so the ~470KB topology never reaches the browser.

const WIDTH = 760;
const HEIGHT = 820;

const topo = topoData as unknown as Topology;

function buildStates(): FeatureCollection<MultiPolygon, { name: string }> {
  const districts = topo.objects.districts as GeometryCollection<{ st_nm?: string }>;
  const byState = new Map<string, AreaGeometry[]>();

  for (const geom of districts.geometries) {
    const props = geom.properties as { st_nm?: string } | undefined;
    const name = props?.st_nm ?? "Unknown";
    const bucket = byState.get(name) ?? [];
    bucket.push(geom as AreaGeometry);
    byState.set(name, bucket);
  }

  const features: Feature<MultiPolygon, { name: string }>[] = [];
  for (const [name, geoms] of byState) {
    features.push({
      type: "Feature",
      properties: { name },
      geometry: merge(topo, geoms) as MultiPolygon,
    });
  }
  return { type: "FeatureCollection", features };
}

// Computed once per server process.
const states = buildStates();
const projection = geoMercator().fitSize([WIDTH, HEIGHT], states);
const pathGen = geoPath(projection);

export interface StatePath {
  name: string;
  d: string;
}

export interface ProjectedMarker<T> {
  data: T;
  x: number;
  y: number;
}

export interface IndiaMapGeometry<T> {
  width: number;
  height: number;
  states: StatePath[];
  markers: ProjectedMarker<T>[];
}

export function projectIndia<T extends { lat: number | null; lng: number | null }>(
  items: T[],
): IndiaMapGeometry<T> {
  const statePaths: StatePath[] = states.features.map((f) => ({
    name: f.properties.name,
    d: pathGen(f) ?? "",
  }));

  const markers: ProjectedMarker<T>[] = [];
  for (const item of items) {
    if (item.lat == null || item.lng == null) continue;
    const xy = projection([item.lng, item.lat]);
    if (!xy) continue;
    markers.push({ data: item, x: xy[0], y: xy[1] });
  }

  return { width: WIDTH, height: HEIGHT, states: statePaths, markers };
}

import "server-only";
import type { CategoryKey, ExpenditureWithMp, Mp } from "@/lib/types";
import { DATA_SOURCES } from "@/lib/constants";
import { scoreRisk } from "@/lib/risk";
import { lookupState } from "@/data/state-centroids";

// Live data source: real MPLADS public-works spending from data.gov.in
// (Ministry of Statistics & Programme Implementation). We combine two official
// datasets:
//   1. State-wise expenditure (₹ crore) for 2016-17, 2018-19, 2019-20
//   2. Sector-wise split (% across roads, education, water, sanitation, etc.)
// The per-state TOTAL is the real reported figure; the per-sector breakdown
// applies each state's reported sector mix to that total (disclosed as derived).

const API_BASE = "https://api.data.gov.in/resource";
// data.gov.in's published public sample key. Override with your own (higher
// rate limits) via DATA_GOV_IN_API_KEY.
const PUBLIC_SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const CRORE = 10_000_000;
const PERIOD_END = "2020-03-31T00:00:00.000Z"; // covers FY2016-17 to FY2019-20

function apiKey(): string {
  return process.env.DATA_GOV_IN_API_KEY || PUBLIC_SAMPLE_KEY;
}

interface DataGovResponse {
  total?: number;
  records?: Record<string, unknown>[];
}

// data.gov.in caps responses to a small page size, so we advance the offset by
// the number of rows actually returned (not the requested limit) until we've
// collected every record.
async function fetchAllRows(resourceId: string): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  const pageSize = 100;
  let offset = 0;
  for (let guard = 0; guard < 50; guard++) {
    const url = `${API_BASE}/${resourceId}?api-key=${apiKey()}&format=json&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, { next: { revalidate: 21_600 } }); // 6h cache
    if (!res.ok) throw new Error(`data.gov.in ${resourceId} -> HTTP ${res.status}`);
    const json = (await res.json()) as DataGovResponse;
    const page = json.records ?? [];
    rows.push(...page);
    const total = Number(json.total ?? rows.length);
    offset += page.length;
    if (page.length === 0 || rows.length >= total) break;
  }
  return rows;
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const SECTOR_FIELDS: Array<[field: string, category: CategoryKey, label: string]> = [
  ["railways__roads__pathways___bridges", "roads", "Roads, rail & bridges"],
  ["education", "education", "Education"],
  ["drinking_water_facility", "water", "Drinking water"],
  ["sanitation___public_health", "sanitation", "Sanitation & health"],
  ["other_public_facilities", "public_facilities", "Public facilities"],
  ["others", "others", "Others"],
];

interface StateAggregate {
  totalCrore: number;
  works: number;
}

export async function fetchMpladsRecords(): Promise<ExpenditureWithMp[]> {
  const [worksRows, sectorRows] = await Promise.all([
    fetchAllRows(DATA_SOURCES.worksResource),
    fetchAllRows(DATA_SOURCES.sectorsResource),
  ]);

  // 1. Real per-state expenditure totals + completed-works counts.
  const totals = new Map<string, StateAggregate>();
  for (const row of worksRows) {
    const info = lookupState(String(row.state ?? ""));
    if (!info) continue;
    const crore =
      num(row._2016_17___expenditure___incurred_with__rs__crore_) +
      num(row._2018_19___expenditure___incurred_with__rs__crore_) +
      num(row._2019_20___expenditure___incurred_with__rs__crore_);
    const works =
      num(row._2016_17___completed___works) +
      num(row._2018_19___completed___works) +
      num(row._2019_20___completed___works);
    const prev = totals.get(info.slug) ?? { totalCrore: 0, works: 0 };
    totals.set(info.slug, {
      totalCrore: prev.totalCrore + crore,
      works: prev.works + works,
    });
  }

  const sourceUrl = DATA_SOURCES.catalogUrl;
  const records: ExpenditureWithMp[] = [];

  // 2. Apply each state's sector split to its real total.
  for (const row of sectorRows) {
    const info = lookupState(String(row.state__ut_name ?? ""));
    if (!info) continue;
    const aggregate = totals.get(info.slug);
    if (!aggregate || aggregate.totalCrore <= 0) continue;

    const mp: Mp = {
      id: info.slug,
      slug: info.slug,
      name: info.name,
      party: "MPLADS",
      house: "State / UT",
      constituency: "",
      state: info.name,
      photoUrl: null,
      lat: info.lat,
      lng: info.lng,
      bio: `₹${Math.round(aggregate.totalCrore).toLocaleString("en-IN")} crore of MPLADS works expenditure across FY2016-17 to FY2019-20, with ${aggregate.works.toLocaleString("en-IN")} works completed.`,
    };

    for (const [field, category, label] of SECTOR_FIELDS) {
      const pct = num(row[field]);
      if (pct <= 0) continue;
      const amount = Math.round((aggregate.totalCrore * pct) / 100) * CRORE;
      if (amount <= 0) continue;
      records.push({
        id: `${info.slug}_${category}`,
        mpId: info.slug,
        category,
        amount,
        vendor: "data.gov.in · MoSPI",
        note: `${label}: ${pct}% of ${info.name}'s ₹${Math.round(aggregate.totalCrore).toLocaleString("en-IN")} cr MPLADS works expenditure (FY2016-17 to FY2019-20). Sector share derived from the state's reported mix.`,
        location: info.name,
        state: info.name,
        lat: info.lat,
        lng: info.lng,
        occurredAt: PERIOD_END,
        sourceUrl,
        risk: scoreRisk({ amount }),
        mp,
      });
    }
  }

  records.sort((a, b) => b.amount - a.amount);
  return records;
}

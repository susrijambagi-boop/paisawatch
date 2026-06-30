import dataset from "@/data/mps-affidavits.json";

// Access layer for the real MP dataset (Lok Sabha 2024). Everything is FACTUAL:
// affidavit facts (ADR/MyNeta) + performance (PRS) + state link. No invented
// scores or judgements.

export interface PrsMetrics {
  attendance: number | null;
  debates: number | null;
  questions: number | null;
  pmb: number | null;
  natAttendance: number | null;
  natDebates: number | null;
  natQuestions: number | null;
  url: string;
}

export interface Rep {
  id: string;
  name: string;
  constituency: string;
  state: string | null;
  stateSlug: string | null;
  party: string;
  criminalCases: number; // self-declared PENDING cases (not convictions)
  education: string;
  assets: number;
  liabilities: number;
  sourceUrl: string;
  prs: PrsMetrics | null;
  photoUrl: string | null;
}

// Reserved/SC/ST status is encoded in the MyNeta constituency name suffix.
export function constituencyCategory(constituency: string): "GEN" | "SC" | "ST" {
  if (/\(ST\)/i.test(constituency)) return "ST";
  if (/\(SC\)/i.test(constituency)) return "SC";
  return "GEN";
}

interface Dataset {
  sources: Record<string, string>;
  scrapedAt: string;
  count: number;
  records: Rep[];
}

const data = dataset as Dataset;
const REPS: Rep[] = data.records;
export const REPS_SOURCE = { ...data.sources, scrapedAt: data.scrapedAt, count: data.count };

const ASSETS_SORTED = [...REPS.map((r) => r.assets)].sort((a, b) => a - b);

export function assetPercentile(amount: number): number {
  let lo = 0;
  let hi = ASSETS_SORTED.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ASSETS_SORTED[mid] <= amount) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / ASSETS_SORTED.length) * 100);
}

export interface RepFilters {
  search?: string;
  parties?: string[];
  states?: string[];
  educations?: string[];
  categories?: string[]; // GEN / SC / ST
  minAssets?: number;
  maxAssets?: number;
  minLiabilities?: number;
  minAttendance?: number;
  minQuestions?: number;
  minDebates?: number;
  minActivity?: number;
  withCasesOnly?: boolean;
  cleanOnly?: boolean; // no declared cases
  netWorthPositive?: boolean;
  hasPrs?: boolean;
  sort?: "assets" | "cases" | "attendance" | "questions" | "activity" | "name";
}

// Broad education buckets so the dropdown stays short.
export function educationBucket(raw: string): string {
  const e = (raw || "").toLowerCase();
  if (e.includes("doctorate") || e.includes("ph")) return "Doctorate";
  if (e.includes("post graduate") || e.includes("post-graduate")) return "Post Graduate";
  if (e.includes("graduate professional")) return "Graduate Professional";
  if (e.includes("graduate")) return "Graduate";
  if (e.includes("12")) return "12th Pass";
  if (e.includes("10") || e.includes("8th") || e.includes("5th")) return "School";
  if (e.includes("literate") || e.includes("illiterate")) return "Literate / Others";
  return "Others";
}

export function getReps(filters: RepFilters = {}): Rep[] {
  let list = REPS.filter((r) => {
    if (filters.parties?.length && !filters.parties.includes(r.party)) return false;
    if (filters.states?.length && !(r.state && filters.states.includes(r.state))) return false;
    if (filters.educations?.length && !filters.educations.includes(educationBucket(r.education))) return false;
    if (filters.categories?.length && !filters.categories.includes(constituencyCategory(r.constituency))) return false;
    if (filters.minAssets != null && r.assets < filters.minAssets) return false;
    if (filters.maxAssets != null && r.assets > filters.maxAssets) return false;
    if (filters.minLiabilities != null && r.liabilities < filters.minLiabilities) return false;
    if (filters.minAttendance != null && (r.prs?.attendance ?? -1) < filters.minAttendance) return false;
    if (filters.minQuestions != null && (r.prs?.questions ?? -1) < filters.minQuestions) return false;
    if (filters.minDebates != null && (r.prs?.debates ?? -1) < filters.minDebates) return false;
    if (filters.minActivity != null && (activityIndex(r) ?? -1) < filters.minActivity) return false;
    if (filters.withCasesOnly && r.criminalCases <= 0) return false;
    if (filters.cleanOnly && r.criminalCases > 0) return false;
    if (filters.netWorthPositive && r.assets - r.liabilities <= 0) return false;
    if (filters.hasPrs && !r.prs) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${r.name} ${r.constituency} ${r.party} ${r.state ?? ""}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sort = filters.sort ?? "name";
  list = [...list].sort((a, b) => {
    if (sort === "assets") return b.assets - a.assets;
    if (sort === "cases") return b.criminalCases - a.criminalCases;
    if (sort === "attendance") return (b.prs?.attendance ?? -1) - (a.prs?.attendance ?? -1);
    if (sort === "questions") return (b.prs?.questions ?? -1) - (a.prs?.questions ?? -1);
    if (sort === "activity") return (activityIndex(b) ?? -1) - (activityIndex(a) ?? -1);
    return a.name.localeCompare(b.name);
  });
  return list;
}

export function getRep(id: string): Rep | null {
  return REPS.find((r) => r.id === id) ?? null;
}

export function getRepsByState(stateSlug: string): Rep[] {
  return REPS.filter((r) => r.stateSlug === stateSlug).sort((a, b) => a.name.localeCompare(b.name));
}

export function getParties(): string[] {
  return [...new Set(REPS.map((r) => r.party))].filter(Boolean).sort();
}

export function getRepStates(): string[] {
  return [...new Set(REPS.map((r) => r.state).filter(Boolean) as string[])].sort();
}

export function getEducationLevels(): string[] {
  const order = ["Doctorate", "Post Graduate", "Graduate Professional", "Graduate", "12th Pass", "School", "Literate / Others", "Others"];
  const present = new Set(REPS.map((r) => educationBucket(r.education)));
  return order.filter((o) => present.has(o));
}

// Transparent composite from PRS metrics only — a mechanical activity score,
// NOT a rating of an MP's merit or worth. Returns 0-100 or null if no data.
export function activityIndex(rep: Rep): number | null {
  const p = rep.prs;
  if (!p || p.attendance == null) return null;
  const att = Math.min(1, p.attendance / 100);
  const deb = p.natDebates ? Math.min(1, (p.debates ?? 0) / (p.natDebates * 2)) : 0;
  const qns = p.natQuestions ? Math.min(1, (p.questions ?? 0) / (p.natQuestions * 2)) : 0;
  return Math.round(((att + deb + qns) / 3) * 100);
}

export interface RepStats {
  total: number;
  withCases: number;
  withSeriousAssets: number;
  medianAssets: number;
}

export function getRepStats(): RepStats {
  const total = REPS.length;
  return {
    total,
    withCases: REPS.filter((r) => r.criminalCases > 0).length,
    withSeriousAssets: REPS.filter((r) => r.assets >= 10_000_000).length,
    medianAssets: ASSETS_SORTED[Math.floor(ASSETS_SORTED.length / 2)] ?? 0,
  };
}

export interface ScorecardItem {
  label: string;
  value: string;
  note?: string;
  tone: "neutral" | "info" | "warn" | "good";
  href?: string; // when present, the value links out (e.g. to the case record)
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// A FACTUAL scorecard: declared facts + measured performance, each with context.
// Never a merit rating.
export function buildScorecard(rep: Rep): ScorecardItem[] {
  const pct = assetPercentile(rep.assets);
  const items: ScorecardItem[] = [
    {
      label: "Self-declared pending criminal cases",
      value: String(rep.criminalCases),
      note: rep.criminalCases > 0
        ? "Pending cases declared in affidavit — not convictions. Click to see the actual cases."
        : "No pending cases declared in affidavit.",
      tone: rep.criminalCases > 0 ? "warn" : "good",
      href: rep.criminalCases > 0 ? rep.sourceUrl : undefined,
    },
    { label: "Total declared assets", value: inr.format(rep.assets), note: `Higher than ${pct}% of analysed MPs.`, tone: "info", href: rep.sourceUrl },
    { label: "Total declared liabilities", value: inr.format(rep.liabilities), tone: "neutral", href: rep.sourceUrl },
    { label: "Net declared worth", value: inr.format(rep.assets - rep.liabilities), tone: "neutral" },
    { label: "Highest education", value: rep.education || "Not stated", tone: "neutral", href: rep.sourceUrl },
  ];

  if (rep.prs) {
    const cmp = (v: number | null, avg: number | null) =>
      v != null && avg != null ? (v >= avg ? "good" : "warn") : "neutral";
    items.push(
      {
        label: "Parliament attendance",
        value: rep.prs.attendance != null ? `${rep.prs.attendance}%` : "Not available",
        note: rep.prs.natAttendance != null ? `National average ${rep.prs.natAttendance}%` : undefined,
        tone: cmp(rep.prs.attendance, rep.prs.natAttendance),
        href: rep.prs.url,
      },
      {
        label: "Debates participated",
        value: rep.prs.debates != null ? String(rep.prs.debates) : "Not available",
        note: rep.prs.natDebates != null ? `National average ${rep.prs.natDebates}` : undefined,
        tone: cmp(rep.prs.debates, rep.prs.natDebates),
        href: rep.prs.url,
      },
      {
        label: "Questions asked",
        value: rep.prs.questions != null ? String(rep.prs.questions) : "Not available",
        note: rep.prs.natQuestions != null ? `National average ${rep.prs.natQuestions}` : undefined,
        tone: cmp(rep.prs.questions, rep.prs.natQuestions),
        href: rep.prs.url,
      },
      {
        label: "Private member's bills",
        value: rep.prs.pmb != null ? String(rep.prs.pmb) : "Not available",
        tone: "neutral",
        href: rep.prs.url,
      },
    );
    const idx = activityIndex(rep);
    if (idx != null) {
      items.push({
        label: "Activity index",
        value: `${idx} / 100`,
        note: "Mechanical composite of attendance, debates & questions vs national averages — not a merit rating.",
        tone: idx >= 50 ? "good" : "info",
      });
    }
  }
  return items;
}

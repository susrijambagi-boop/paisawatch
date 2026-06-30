import { type Rep, educationBucket, constituencyCategory } from "./reps";
import ap from "@/data/mlas-AndhraPradesh2024.json";
import ar from "@/data/mlas-ArunachalPradesh2024.json";
import as from "@/data/mlas-Assam2021.json";
import br from "@/data/mlas-Bihar2025.json";
import cg from "@/data/mlas-Chhattisgarh2023.json";
import dl from "@/data/mlas-Delhi2025.json";
import hr from "@/data/mlas-Haryana2024.json";
import hp from "@/data/mlas-HimachalPradesh2022.json";
import jh from "@/data/mlas-Jharkhand2024.json";
import kl from "@/data/mlas-Kerala2021.json";
import mp from "@/data/mlas-MadhyaPradesh2023.json";
import mh from "@/data/mlas-Maharashtra2024.json";
import mn from "@/data/mlas-Manipur2022.json";
import mz from "@/data/mlas-Mizoram2023.json";
import od from "@/data/mlas-Odisha2024.json";
import pb from "@/data/mlas-Punjab2022.json";
import rj from "@/data/mlas-Rajasthan2023.json";
import sk from "@/data/mlas-Sikkim2024.json";
import tn from "@/data/mlas-TamilNadu2021.json";
import tg from "@/data/mlas-Telangana2023.json";
import up from "@/data/mlas-UttarPradesh2022.json";
import uk from "@/data/mlas-Uttarakhand2022.json";
import wb from "@/data/mlas-WestBengal2021.json";
import jk from "@/data/mlas-JammuKashmir2024.json";
import ga from "@/data/mlas-goa2022.json";
import gj from "@/data/mlas-gujarat2022.json";
import ka from "@/data/mlas-karnataka2023.json";
import ml from "@/data/mlas-meghalaya2023.json";
import nl from "@/data/mlas-nagaland2023.json";
import tr from "@/data/mlas-tripura2023.json";

// All sitting state-assembly MLAs from ADR/MyNeta affidavits. Same factual
// shape as MPs (reuse Rep + buildScorecard); no PRS performance data exists for
// MLAs, so prs is null.

interface MlaDataset {
  sources: Record<string, string>;
  house: string;
  stateName: string;
  stateSlug: string;
  scrapedAt: string;
  count: number;
  records: Rep[];
}

const DATASETS = [ap, ar, as, br, cg, dl, hr, hp, jh, kl, mp, mh, mn, mz, od, pb, rj, sk, tn, tg, up, uk, wb, jk, ga, gj, ka, ml, nl, tr] as unknown as MlaDataset[];
const ALL: Rep[] = DATASETS.flatMap((d) => d.records);

export const MLA_STATES = DATASETS.map((d) => ({
  state: d.stateName,
  slug: d.stateSlug,
  house: d.house,
  count: d.count,
  scrapedAt: d.scrapedAt,
  source: d.sources.affidavit,
})).sort((a, b) => a.state.localeCompare(b.state));

export interface MlaFilters {
  search?: string;
  states?: string[]; // state slugs
  parties?: string[];
  educations?: string[];
  categories?: string[];
  minAssets?: number;
  withCasesOnly?: boolean;
  cleanOnly?: boolean;
  sort?: "assets" | "cases" | "name";
}

export function getMlas(filters: MlaFilters = {}): Rep[] {
  let list = ALL.filter((r) => {
    if (filters.states?.length && !(r.stateSlug && filters.states.includes(r.stateSlug))) return false;
    if (filters.parties?.length && !filters.parties.includes(r.party)) return false;
    if (filters.educations?.length && !filters.educations.includes(educationBucket(r.education))) return false;
    if (filters.categories?.length && !filters.categories.includes(constituencyCategory(r.constituency))) return false;
    if (filters.minAssets != null && r.assets < filters.minAssets) return false;
    if (filters.withCasesOnly && r.criminalCases <= 0) return false;
    if (filters.cleanOnly && r.criminalCases > 0) return false;
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
    return a.name.localeCompare(b.name);
  });
  return list;
}

export function getMla(id: string): Rep | null {
  return ALL.find((r) => r.id === id) ?? null;
}

export function getMlaParties(): string[] {
  return [...new Set(ALL.map((r) => r.party))].filter(Boolean).sort();
}

export function getMlaStateNames(): string[] {
  return MLA_STATES.map((s) => s.state);
}

export function getMlaEducationLevels(): string[] {
  const order = ["Doctorate", "Post Graduate", "Graduate Professional", "Graduate", "12th Pass", "School", "Literate / Others", "Others"];
  const present = new Set(ALL.map((r) => educationBucket(r.education)));
  return order.filter((o) => present.has(o));
}

export interface MlaStats {
  total: number;
  states: number;
  withCases: number;
  crorepatis: number;
}

export function getMlaStats(): MlaStats {
  return {
    total: ALL.length,
    states: DATASETS.length,
    withCases: ALL.filter((r) => r.criminalCases > 0).length,
    crorepatis: ALL.filter((r) => r.assets >= 10_000_000).length,
  };
}

// Map a state name -> slug, for filtering by display name from the UI.
export function stateNameToSlug(name: string): string | undefined {
  return MLA_STATES.find((s) => s.state === name)?.slug;
}

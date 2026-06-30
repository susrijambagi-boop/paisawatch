// Builds the MP dataset from public sources and vendors it to
// src/data/mps-affidavits.json. Run: npx tsx scripts/scrape-myneta.ts
//
// Sources (all factual / self-declared, with per-record source links):
//   * ADR / MyNeta — affidavit facts: pending criminal cases (NOT convictions),
//     declared assets, liabilities, education, party, constituency.
//   * PRS Legislative Research — 18th Lok Sabha performance: attendance %,
//     debates, questions, private member's bills (with national averages).
//   * datameet PC->state map (src/data/pc-state.json) to link an MP to their
//     state's MPLADS spending.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MYNETA = "https://myneta.info/LokSabha2024/index.php?action=show_winners&state_id=3";
const PRS_BASE = "https://prsindia.org/mptrack/18th-lok-sabha/";
const OUT = resolve(process.cwd(), "src/data/mps-affidavits.json");
const PC_STATE = resolve(process.cwd(), "src/data/pc-state.json");
const UA = "Mozilla/5.0 (PaisaWatch data ingest; civic transparency)";

const pcState: { map: Record<string, string> } = JSON.parse(readFileSync(PC_STATE, "utf8"));

const normPc = (s: string) => s.replace(/\([^)]*\)/g, "").replace(/[^a-z]/gi, " ").trim().toUpperCase().replace(/\s+/g, " ");
const stateSlug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const prsSlug = (name: string) => name.toLowerCase().replace(/[.'()]/g, "").replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function rupees(text: string): number {
  const m = text.replace(/&nbsp;/g, " ").match(/Rs\s*([\d,]+)/i);
  return m ? Number(m[1].replace(/,/g, "")) || 0 : 0;
}
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

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

async function fetchPrs(name: string): Promise<PrsMetrics | null> {
  const url = `${PRS_BASE}${prsSlug(name)}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const txt = (await res.text()).replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    const sel = (label: string, unit = "") => {
      const re = new RegExp(`${label}\\s+Selected MP\\s+(\\d+(?:\\.\\d+)?)\\s*${unit}`, "i");
      const m = txt.match(re);
      return m ? Number(m[1]) : null;
    };
    const nat = (label: string, unit = "") => {
      const re = new RegExp(`${label}[\\s\\S]{0,40}?National Average\\s+(\\d+(?:\\.\\d+)?)\\s*${unit}`, "i");
      const m = txt.match(re);
      return m ? Number(m[1]) : null;
    };
    const attendance = sel("Attendance", "%");
    if (attendance === null && sel("Debates") === null) return null; // no track page
    return {
      attendance,
      debates: sel("Debates"),
      questions: sel("Questions"),
      pmb: sel("Private Member'?s? Bills"),
      natAttendance: nat("Attendance", "%"),
      natDebates: nat("Debates"),
      natQuestions: nat("Questions"),
      url,
    };
  } catch {
    return null;
  }
}

// Extract the candidate's public affidavit photo URL from their MyNeta page.
async function fetchPhoto(id: string): Promise<string | null> {
  const url = `https://myneta.info/LokSabha2024/candidate.php?candidate_id=${id}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/https:\/\/myneta\.info\/images_candidate\/[^"'\s>]+\.(?:jpg|jpeg|png)/i);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

// Run async tasks with bounded concurrency to be polite to the sources.
async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

async function main() {
  const res = await fetch(MYNETA, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`MyNeta HTTP ${res.status}`);
  const html = await res.text();

  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const seen = new Set<string>();
  const base = [];
  for (const row of rows) {
    const idMatch = row.match(/candidate_id=(\d+)/);
    if (!idMatch) continue;
    const cells = (row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) ?? []).map(stripTags);
    if (cells.length < 8) continue;
    const id = idMatch[1];
    if (seen.has(id)) continue;
    seen.add(id);
    const constituency = cells[2];
    const state = pcState.map[normPc(constituency)] ?? null;
    base.push({
      id,
      name: cells[1],
      constituency,
      state,
      stateSlug: state ? stateSlug(state) : null,
      party: cells[3],
      criminalCases: parseInt(cells[4], 10) || 0,
      education: cells[5],
      assets: rupees(cells[6]),
      liabilities: rupees(cells[7]),
      sourceUrl: `https://myneta.info/LokSabha2024/candidate.php?candidate_id=${id}`,
    });
  }
  console.log(`Parsed ${base.length} MPs from MyNeta. Fetching PRS track records…`);

  const enriched = await pool(base, 8, async (mp) => {
    const [prs, photoUrl] = await Promise.all([fetchPrs(mp.name), fetchPhoto(mp.id)]);
    return { prs, photoUrl };
  });
  const records = base.map((mp, i) => ({ ...mp, prs: enriched[i].prs, photoUrl: enriched[i].photoUrl }));

  const matchedState = records.filter((r) => r.state).length;
  const matchedPrs = records.filter((r) => r.prs).length;
  const matchedPhoto = records.filter((r) => r.photoUrl).length;
  records.sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        sources: {
          affidavit: "https://myneta.info/LokSabha2024/ (ADR / MyNeta)",
          performance: "https://prsindia.org/mptrack/18th-lok-sabha (PRS Legislative Research)",
          pcState: "datameet/maps india_pc_2019",
        },
        scrapedAt: new Date().toISOString(),
        count: records.length,
        records,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${records.length} MPs → ${OUT}`);
  console.log(`  state: ${matchedState}/${records.length} | PRS: ${matchedPrs}/${records.length} | photos: ${matchedPhoto}/${records.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

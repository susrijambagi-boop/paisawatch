// Scrapes MLA affidavit data from ADR/MyNeta and vendors per-state files
// src/data/mlas-<site>.json. Usage:
//   npx tsx scripts/scrape-mla.ts all            # every configured state (no photos, fast)
//   npx tsx scripts/scrape-mla.ts all --photos   # every state WITH photos (slow)
//   npx tsx scripts/scrape-mla.ts Maharashtra2024 "Maharashtra" --photos
//
// Factual affidavit fields only (pending cases — NOT convictions — assets,
// liabilities, education, party). Existing photo URLs are preserved across runs
// so a no-photo refresh never drops photos already captured.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { MLA_STATE_SITES } from "./mla-states";

const UA = "Mozilla/5.0 (PaisaWatch data ingest; civic transparency)";

function rupees(text: string): number {
  const m = text.replace(/&nbsp;/g, " ").match(/Rs\s*([\d,]+)/i);
  return m ? Number(m[1].replace(/,/g, "")) || 0 : 0;
}
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

async function fetchPhoto(base: string, id: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(`${base}/candidate.php?candidate_id=${id}`, { headers: { "User-Agent": UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/https:\/\/myneta\.info\/images_candidate\/[^"'\s>]+\.(?:jpg|jpeg|png)/i);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function scrapeState(site: string, stateName: string, withPhotos: boolean) {
  const stateSlug = stateName.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const base = `https://myneta.info/${site}`;
  const out = resolve(process.cwd(), `src/data/mlas-${site}.json`);

  // Preserve any photo URLs already captured for this state.
  const priorPhotos = new Map<string, string>();
  if (existsSync(out)) {
    try {
      const prev = JSON.parse(readFileSync(out, "utf8"));
      for (const r of prev.records ?? []) if (r.photoUrl) priorPhotos.set(r.id, r.photoUrl);
    } catch {}
  }

  const seen = new Set<string>();
  const records: Record<string, unknown>[] = [];
  const addRowsFrom = (html: string): number => {
    let added = 0;
    for (const row of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? []) {
      const idMatch = row.match(/candidate_id=(\d+)/);
      if (!idMatch) continue;
      const cells = (row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) ?? []).map(stripTags);
      if (cells.length < 8) continue;
      const id = idMatch[1];
      if (seen.has(id)) continue;
      seen.add(id);
      added++;
      records.push({
        id, name: cells[1], constituency: cells[2], state: stateName, stateSlug,
        party: cells[3], criminalCases: parseInt(cells[4], 10) || 0, education: cells[5],
        assets: rupees(cells[6]), liabilities: rupees(cells[7]),
        sourceUrl: `${base}/candidate.php?candidate_id=${id}`, prs: null,
        photoUrl: priorPhotos.get(id) ?? null,
      });
    }
    return added;
  };

  // Primary: the single-page "show_winners" list.
  const res = await fetch(`${base}/index.php?action=show_winners&state_id=3`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`MyNeta ${site} HTTP ${res.status}`);
  addRowsFrom(await res.text());

  // Fallback for sites where show_winners is empty: paginate winner_analyzed.
  if (records.length === 0) {
    for (let page = 1; page <= 60; page++) {
      const pr = await fetch(`${base}/index.php?action=summary&subAction=winner_analyzed&page=${page}`, { headers: { "User-Agent": UA } });
      if (!pr.ok) break;
      if (addRowsFrom(await pr.text()) === 0) break;
    }
  }

  if (withPhotos) {
    const photos = await pool(records, 8, (r) => fetchPhoto(base, String(r.id)));
    records.forEach((r, i) => { if (!r.photoUrl) r.photoUrl = photos[i]; });
  }

  records.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  writeFileSync(out, JSON.stringify({
    sources: { affidavit: `${base}/ (ADR / MyNeta)` },
    house: `${stateName} Legislative Assembly`,
    stateName, stateSlug, scrapedAt: new Date().toISOString(),
    count: records.length, records,
  }, null, 2));
  const photoN = records.filter((r) => r.photoUrl).length;
  console.log(`  ${stateName}: ${records.length} MLAs (photos ${photoN}/${records.length}) → ${out}`);
  return records.length;
}

async function main() {
  const arg = process.argv[2] || "all";
  const withPhotos = process.argv.includes("--photos");

  if (arg === "all") {
    let total = 0;
    for (const s of MLA_STATE_SITES) {
      try { total += await scrapeState(s.site, s.state, withPhotos); }
      catch (e) { console.error(`  ! ${s.state} failed:`, e instanceof Error ? e.message : e); }
    }
    console.log(`Done. ${total} MLAs across ${MLA_STATE_SITES.length} states.`);
  } else {
    const stateName = process.argv[3] || arg;
    await scrapeState(arg, stateName, withPhotos);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });

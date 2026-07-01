// Fetches real MPLADS spending from data.gov.in and vendors it to
// src/data/mplads.json, so the app reads it from the repo instead of hitting a
// rate-limited API at request time. Run: npx tsx scripts/fetch-mplads.ts
// (also runs daily in the data-refresh GitHub Action).

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchMpladsRecords } from "../src/lib/sources/mplads-core";

async function main() {
  const records = await fetchMpladsRecords();
  if (records.length === 0) throw new Error("No MPLADS records fetched — aborting (won't overwrite).");

  const out = resolve(process.cwd(), "src/data/mplads.json");
  const states = new Set(records.map((r) => r.state)).size;
  writeFileSync(
    out,
    JSON.stringify(
      { source: "https://www.data.gov.in (MoSPI, MPLADS)", scrapedAt: new Date().toISOString(), count: records.length, states, records },
      null,
      0,
    ),
  );
  console.log(`Wrote ${records.length} MPLADS records across ${states} states -> ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

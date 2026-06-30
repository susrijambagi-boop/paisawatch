// MPLADS ingestion skeleton. Run on a schedule (Vercel Cron / GitHub Action).
//
//   npm run ingest
//
// This is the bridge from real public data to the app. It is intentionally a
// scaffold: the MPLADS portal (https://mplads.gov.in) exposes works data as
// downloadable reports rather than a clean JSON API, so the fetch + parse step
// below MUST be implemented against the actual source format you choose
// (MPLADS works export, PFMS payments, or a data.gov.in resource).
//
// Hard rules for real data:
//   * Every record MUST carry a source_url back to the official portal.
//   * Never invent fields. If a value is missing, leave it null.
//   * Officials must exist in `mps` first (see scripts/seed.ts) and be matched
//     by a stable id — do not fuzzy-match names into spending blindly.

import { getServiceClient } from "../src/lib/supabase";
import type { CategoryKey } from "../src/lib/types";

interface NormalizedRecord {
  mpId: string;
  category: CategoryKey;
  amount: number;
  vendor: string;
  note: string;
  location: string;
  state: string;
  lat: number | null;
  lng: number | null;
  occurredAt: string;
  sourceUrl: string;
}

// TODO: implement against the real source.
// Example shape for an MPLADS works export -> NormalizedRecord[].
async function fetchAndNormalize(): Promise<NormalizedRecord[]> {
  // const res = await fetch(MPLADS_REPORT_URL);
  // const rows = await parseReport(await res.text());
  // return rows.map(mapRowToRecord);
  console.warn(
    "fetchAndNormalize() is a stub. Implement parsing for your chosen source " +
      "(MPLADS works export, PFMS, or data.gov.in) before scheduling this.",
  );
  return [];
}

async function main() {
  const client = getServiceClient();
  if (!client) {
    console.error("No service-role Supabase credentials. Aborting.");
    process.exit(1);
  }

  const records = await fetchAndNormalize();
  if (records.length === 0) {
    console.log("No records to ingest.");
    return;
  }

  const rows = records.map((r) => ({
    mp_id: r.mpId,
    category: r.category,
    amount: r.amount,
    vendor: r.vendor,
    note: r.note,
    location: r.location,
    state: r.state,
    lat: r.lat,
    lng: r.lng,
    occurred_at: r.occurredAt,
    source_url: r.sourceUrl,
  }));

  // Upsert keyed on source_url would require a unique constraint; for now we
  // insert and rely on the source_url for dedupe in a follow-up migration.
  const { error } = await client.from("expenditures").insert(rows);
  if (error) throw error;
  console.log(`Ingested ${rows.length} records.`);

  // TODO: after insert, fan out alerts to matching subscribers
  // (see src/lib/data.ts subscriptions + src/app/api/push).
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

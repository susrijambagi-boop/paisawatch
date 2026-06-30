// Seed the database with officials. Run: npm run seed
// By default it loads ONLY the (fictional) demo officials so a fresh database
// has profiles to render. Pass --with-expenditures to also load demo spending
// for local testing — never do this against a public/production database, since
// the demo spend is fabricated.

import { DEMO_MPS, demoExpenditures } from "../src/data/demo";
import { getServiceClient } from "../src/lib/supabase";

async function main() {
  const client = getServiceClient();
  if (!client) {
    console.error("No SUPABASE_SERVICE_ROLE_KEY / URL set. Aborting.");
    process.exit(1);
  }

  const mps = DEMO_MPS.map((mp) => ({
    id: mp.id,
    slug: mp.slug,
    name: mp.name,
    party: mp.party,
    house: mp.house,
    constituency: mp.constituency,
    state: mp.state,
    photo_url: mp.photoUrl,
    lat: mp.lat,
    lng: mp.lng,
    bio: mp.bio,
  }));

  const { error: mpError } = await client.from("mps").upsert(mps);
  if (mpError) throw mpError;
  console.log(`Seeded ${mps.length} officials.`);

  if (process.argv.includes("--with-expenditures")) {
    const rows = demoExpenditures().map((e) => ({
      mp_id: e.mpId,
      category: e.category,
      amount: e.amount,
      vendor: e.vendor,
      note: e.note,
      location: e.location,
      state: e.state,
      lat: e.lat,
      lng: e.lng,
      occurred_at: e.occurredAt,
      source_url: e.sourceUrl,
    }));
    const { error } = await client.from("expenditures").insert(rows);
    if (error) throw error;
    console.log(`Seeded ${rows.length} DEMO expenditures (testing only).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

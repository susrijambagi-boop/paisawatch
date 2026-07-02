// Generates ready-to-post social captions from the live site numbers, so the
// GTM never needs a blank page. Deterministic templating (no LLM) — picks a
// rotating "state of the week" and fills real figures. Writes
// social/weekly-posts.md. Run weekly by .github/workflows/social.yml.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CRORE = 10_000_000;
const SITE = "https://paisawatch.live";

interface Rec { amount: number; state: string; category: string; note: string }

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), rel), "utf8")) as T;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

function cr(n: number): string {
  return `₹${Math.round(n / CRORE).toLocaleString("en-IN")} cr`;
}

function main() {
  const mplads = readJson<{ records: Rec[] }>("src/data/mplads.json").records;
  const mps = readJson<{ records: { criminalCases: number; assets: number }[] }>("src/data/mps-affidavits.json").records;

  const total = mplads.reduce((s, r) => s + r.amount, 0);
  const byState = new Map<string, number>();
  const topSector = new Map<string, [string, number]>();
  for (const r of mplads) {
    byState.set(r.state, (byState.get(r.state) ?? 0) + r.amount);
    const cur = topSector.get(r.state);
    if (!cur || r.amount > cur[1]) topSector.set(r.state, [r.category, r.amount]);
  }
  const states = [...byState.keys()].sort();
  const spotlight = states[isoWeek(new Date()) % states.length];
  const spotlightTotal = byState.get(spotlight) ?? 0;
  const [sector] = topSector.get(spotlight) ?? ["", 0];
  const sectorLabel = mplads.find((r) => r.state === spotlight && r.category === sector)?.note.split(":")[0] ?? sector;

  const withCases = mps.filter((m) => m.criminalCases > 0).length;
  const crorepatis = mps.filter((m) => m.assets >= CRORE).length;

  const posts = `# PaisaWatch — this week's posts

_Auto-generated ${new Date().toISOString().slice(0, 10)} from live site data. Copy, tweak a word if you like, post._

---

## State of the week: ${spotlight}

**X / Twitter**
> ${spotlight}: ${cr(spotlightTotal)} of MPLADS public-works spending, biggest slice on ${sectorLabel.toLowerCase()}.
> See your own state's split — by sector, source-linked to data.gov.in 👇
> ${SITE}/officials

**WhatsApp**
> Did you know ${spotlight} has ${cr(spotlightTotal)} in tracked MPLADS works? Look up your own state (and your MLA's declared assets & cases) → ${SITE} 🇮🇳

**Instagram caption**
> ${spotlight}, by the numbers: ${cr(spotlightTotal)} of your money, mapped. The receipt for your taxes is public now → link in bio. #PaisaWatch #${spotlight.replace(/\s+/g, "")}

---

## By the numbers

**X / Twitter**
> ${withCases} of India's Lok Sabha MPs declared pending criminal cases. ${crorepatis} are crorepatis. Not a rumour — from their own election affidavits, each one source-linked.
> Look up yours: ${SITE}/reps

**LinkedIn**
> We demand audited disclosures from every company we invest in. From the people who spend our taxes, we get almost nothing usable. PaisaWatch fixes that — ${withCases} MPs' declared cases, ${crorepatis} crorepatis, every figure linked to its official source. Free. → ${SITE}

---

## Evergreen hook (calculators)

**X / Twitter**
> Is your salary actually growing, or just keeping up with inflation? Find out in 10 seconds — then see how much tax you'll pay over your whole career, and where it goes.
> ${SITE}/tools
`;

  const dir = resolve(process.cwd(), "social");
  if (!existsSync(dir)) mkdirSync(dir);
  writeFileSync(resolve(dir, "weekly-posts.md"), posts);
  console.log(`Wrote social/weekly-posts.md — spotlight: ${spotlight} (${cr(spotlightTotal)})`);
}

main();

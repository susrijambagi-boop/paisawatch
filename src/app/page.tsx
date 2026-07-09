import type { Metadata } from "next";
import Link from "next/link";
import { getFeed } from "@/lib/data";
import { getRepStats } from "@/lib/reps";
import { getMlas, getMlaStats } from "@/lib/mlas";
import { CATEGORIES } from "@/lib/constants";
import { formatCompactINR } from "@/lib/format";
import { HBars } from "@/components/HBars";
import { TaxEstimator } from "@/components/TaxEstimator";
import { RealReturns } from "@/components/RealReturns";
import { InfoTip } from "@/components/InfoTip";
import { DEFS } from "@/lib/definitions";
import {
  RUPEE_COMES_FROM,
  RUPEE_GOES_TO,
  BUDGET_YEAR,
  BUDGET_SOURCE,
} from "@/data/budget";

export const metadata: Metadata = {
  title: { absolute: "PaisaWatch: Track India's public money, taxes and your MP" },
  description:
    "See where India's tax money goes, what your MP or MLA declared (assets, cases, attendance), and whether your salary beats inflation. One free, source-linked dashboard built on official public data.",
};

export default async function DashboardPage() {
  const [{ items }, repStats, mlaStats] = await Promise.all([
    getFeed({}, 500),
    Promise.resolve(getRepStats()),
    Promise.resolve(getMlaStats()),
  ]);

  // MPLADS aggregates from the live feed.
  const total = items.reduce((s, i) => s + i.amount, 0);
  const bySector = new Map<string, number>();
  const byState = new Map<string, number>();
  for (const i of items) {
    bySector.set(i.category, (bySector.get(i.category) ?? 0) + i.amount);
    byState.set(i.state, (byState.get(i.state) ?? 0) + i.amount);
  }
  const sectorBars = [...bySector.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => {
      const c = CATEGORIES[k as keyof typeof CATEGORIES];
      return { label: c.label, value: v, display: formatCompactINR(v), def: c.def };
    });

  // Per-state comparison: MPLADS spend + MLA profile stats.
  const mlas = getMlas();
  const stateAgg = new Map<string, { spend: number; mlas: number; crore: number; cases: number }>();
  for (const [state, spend] of byState) stateAgg.set(state, { spend, mlas: 0, crore: 0, cases: 0 });
  for (const m of mlas) {
    if (!m.state) continue;
    const a = stateAgg.get(m.state) ?? { spend: 0, mlas: 0, crore: 0, cases: 0 };
    a.mlas += 1;
    if (m.assets >= 10_000_000) a.crore += 1;
    if (m.criminalCases > 0) a.cases += 1;
    stateAgg.set(m.state, a);
  }
  const compareRows = [...stateAgg.entries()]
    .sort((a, b) => b[1].spend - a[1].spend)
    .slice(0, 12);

  const tiles = [
    { label: "MPLADS tracked", value: formatCompactINR(total), def: DEFS.mpladsTracked },
    { label: "Lok Sabha MPs", value: repStats.total.toLocaleString("en-IN"), def: DEFS.coverage },
    { label: "MLAs (30 assemblies)", value: mlaStats.total.toLocaleString("en-IN"), def: DEFS.coverage },
    { label: "Crorepati reps", value: (repStats.withSeriousAssets + mlaStats.crorepatis).toLocaleString("en-IN"), def: DEFS.crorepati },
    { label: "With declared cases", value: (repStats.withCases + mlaStats.withCases).toLocaleString("en-IN"), accent: "text-amber-600", def: DEFS.declaredCases },
    { label: "States & UTs covered", value: mlaStats.states.toLocaleString("en-IN"), def: "States and union territories whose sitting legislative assembly we currently cover." },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">India&apos;s public money, in one window</h1>
        <p className="mt-1 text-sm text-slate-600">
          Where your tax goes, what your representatives declared, and whether your money is keeping
          up with inflation. All from official public data, free and source-linked.
        </p>
      </section>

      {/* National analytics */}
      <section>
        <h2 className="mb-3 text-base font-semibold">At a glance</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
              <div className={`text-xl font-semibold ${t.accent ?? "text-slate-900"}`}>{t.value}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                {t.label}
                <InfoTip text={t.def} label={t.label} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            MPLADS spend by sector <InfoTip text={DEFS.mplads} />
          </h3>
          <HBars items={sectorBars} />
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            Where the national rupee comes from <InfoTip text={DEFS.rupeeComesFrom} />
          </h3>
          <p className="mb-3 text-xs text-slate-400">Union Budget {BUDGET_YEAR}</p>
          <HBars
            items={RUPEE_COMES_FROM.map((s) => ({ label: s.label, value: s.pct, display: `${s.pct}%`, def: s.def }))}
            color="#2563eb"
          />
        </div>
      </section>

      {/* Where your tax goes */}
      <section>
        <h2 className="mb-1 text-base font-semibold">Where your tax goes</h2>
        <p className="mb-3 text-xs text-slate-500">
          Source:{" "}
          <a className="underline" href="https://www.indiabudget.gov.in" target="_blank" rel="noopener noreferrer">
            {BUDGET_SOURCE}
          </a>
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              The national rupee goes to <InfoTip text={DEFS.rupeeGoesTo} />
            </h3>
            <HBars
              items={RUPEE_GOES_TO.map((s) => ({ label: s.label, value: s.pct, display: `${s.pct}%`, def: s.def }))}
              color="#f59e0b"
            />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Estimate your own tax</h3>
            <TaxEstimator />
          </div>
        </div>
      </section>

      {/* Inflation / real returns */}
      <section>
        <h2 className="text-base font-semibold">Inflation reality check</h2>
        <p className="mb-3 mt-1 text-xs text-slate-500">
          Is your salary actually growing, and will your savings beat inflation? Everything here is
          editable, plug in your own numbers.
        </p>
        <RealReturns />
      </section>

      {/* State comparison */}
      <section>
        <h2 className="text-base font-semibold">Compare states</h2>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-slate-500">
          Each row is a state. <strong>MPLADS spend</strong> = its total tracked public-works
          spending (data.gov.in). <strong>MLAs</strong> = sitting assembly members we have affidavit
          data for. <strong>Crorepati</strong> = those with declared assets ≥ ₹1 crore.{" "}
          <strong>With cases</strong> = those who declared pending criminal cases (charges, not
          convictions). Sorted by spend.
        </p>
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1">MPLADS spend <InfoTip text={DEFS.mplads} /></span>
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1">MLAs <InfoTip text={DEFS.coverage} /></span>
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1">Crorepati <InfoTip text={DEFS.crorepati} /></span>
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="inline-flex items-center gap-1">With cases <InfoTip text={DEFS.declaredCases} /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map(([state, a]) => (
                <tr key={state} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{state}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCompactINR(a.spend)}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{a.mlas || "-"}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{a.crore || "-"}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{a.cases || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          MPLADS spend from data.gov.in; MLA figures from ADR/MyNeta affidavits. See{" "}
          <Link href="/transparency" className="underline">Coverage</Link> for caveats.
        </p>
      </section>
    </div>
  );
}

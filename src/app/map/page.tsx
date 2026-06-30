import type { Metadata } from "next";
import { getFeed } from "@/lib/data";
import { formatCompactINR } from "@/lib/format";
import { IndiaMap } from "@/components/IndiaMap";
import { DemoBanner } from "@/components/DemoBanner";
import { SourceNote } from "@/components/SourceNote";
import { RISK_STYLES } from "@/lib/ui";
import { RISK_TIER_LABEL, type RiskTier } from "@/lib/risk";

export const metadata: Metadata = {
  title: "Spending map",
  description: "Where India's public money was spent, plotted across the country.",
};

export default async function MapPage() {
  const { items, isDemo, source } = await getFeed({}, 500);

  const byState = new Map<string, number>();
  for (const item of items) {
    byState.set(item.state, (byState.get(item.state) ?? 0) + item.amount);
  }
  const topStates = [...byState.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const tiers: RiskTier[] = ["routine", "review", "high"];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Spending map</h1>
        <p className="mt-1 text-sm text-slate-600">
          Each dot is a state&apos;s MPLADS spending in a sector. Size shows the
          amount; colour shows whether it is a small, medium or large item.
        </p>
      </section>

      {isDemo ? <DemoBanner /> : source === "datagovin" && <SourceNote />}

      <IndiaMap items={items} />

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
        {tiers.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: RISK_STYLES[t].hex, opacity: 0.6 }}
            />
            {RISK_TIER_LABEL[t]}
          </span>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold">Top states by tracked spend</h2>
        <div className="space-y-2">
          {topStates.map(([state, amount]) => (
            <div
              key={state}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200"
            >
              <span className="text-sm font-medium text-slate-700">{state}</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCompactINR(amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

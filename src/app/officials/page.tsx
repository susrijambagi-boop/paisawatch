import Link from "next/link";
import type { Metadata } from "next";
import { getMps, getFeed } from "@/lib/data";
import { formatCompactINR } from "@/lib/format";
import { MpAvatar } from "@/components/MpAvatar";
import { DemoBanner } from "@/components/DemoBanner";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "States & UTs",
  description: "Browse states and UTs and follow their MPLADS public-works spending.",
};

export default async function OfficialsPage() {
  const [{ items: mps, isDemo }, { items: expenditures }] = await Promise.all([
    getMps(),
    getFeed({}, 500),
  ]);

  const totals = new Map<string, { total: number; count: number }>();
  for (const e of expenditures) {
    const cur = totals.get(e.mpId) ?? { total: 0, count: 0 };
    totals.set(e.mpId, { total: cur.total + e.amount, count: cur.count + 1 });
  }

  const sorted = [...mps].sort(
    (a, b) => (totals.get(b.id)?.total ?? 0) - (totals.get(a.id)?.total ?? 0),
  );

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">States &amp; UTs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Follow a state to get alerted when new MPLADS spending data is published.
        </p>
      </section>

      {isDemo && <DemoBanner />}

      <div className="space-y-3">
        {sorted.map((mp) => {
          const stat = totals.get(mp.id) ?? { total: 0, count: 0 };
          return (
            <Link
              key={mp.id}
              href={`/mp/${mp.slug}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 hover:ring-slate-300"
            >
              <MpAvatar mp={mp} size="md" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{mp.name}</div>
                <div className="text-xs text-slate-500">
                  {mp.party} · {mp.house}
                </div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="map-pin" /> {mp.constituency}, {mp.state}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {formatCompactINR(stat.total)}
                </div>
                <div className="text-xs text-slate-500">{stat.count} records</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

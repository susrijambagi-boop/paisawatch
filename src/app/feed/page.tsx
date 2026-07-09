import type { Metadata } from "next";
import { getFeed, getMps, computeStats } from "@/lib/data";
import type { CategoryKey, ExpenditureFilters } from "@/lib/types";
import { CATEGORIES, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Spending feed",
  description:
    "A live feed of India's MPLADS public-works spending by state and sector, filterable, source-linked to data.gov.in.",
};
import { DemoBanner } from "@/components/DemoBanner";
import { SourceNote } from "@/components/SourceNote";
import { StatTiles } from "@/components/StatTiles";
import { Filters } from "@/components/Filters";
import { ExpenditureCard } from "@/components/ExpenditureCard";
import { SubscribeForm } from "@/components/SubscribeForm";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function parseFilters(params: Awaited<SearchParams>): ExpenditureFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const category = one(params.category);
  const minRisk = one(params.minRisk);
  return {
    category: category && category in CATEGORIES ? (category as CategoryKey) : undefined,
    state: one(params.state) || undefined,
    search: one(params.q) || undefined,
    minRisk: minRisk ? Number(minRisk) : undefined,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [{ items, isDemo, source }, { items: mps }] = await Promise.all([
    getFeed(filters),
    getMps(),
  ]);
  const states = [...new Set(mps.map((m) => m.state))].filter(Boolean).sort();
  const stats = computeStats(items);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">{SITE.tagline}</h1>
        <p className="mt-1 text-sm text-slate-600">{SITE.description}</p>
      </section>

      {isDemo ? <DemoBanner /> : source === "datagovin" && <SourceNote />}

      <StatTiles stats={stats} />

      <SubscribeForm />

      <Filters states={states} />

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
          No transactions match these filters.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ExpenditureCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

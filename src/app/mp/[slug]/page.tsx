import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMpBySlug, computeStats } from "@/lib/data";
import { formatCompactINR } from "@/lib/format";
import { MpAvatar } from "@/components/MpAvatar";
import { StatTiles } from "@/components/StatTiles";
import { ExpenditureCard } from "@/components/ExpenditureCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { DemoBanner } from "@/components/DemoBanner";
import { ShareButton } from "@/components/ShareButton";
import { Comments } from "@/components/Comments";
import { Icon } from "@/components/Icon";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const { mp, expenditures } = await getMpBySlug(slug);
  if (!mp) return { title: "Official not found" };
  const total = expenditures.reduce((s, e) => s + e.amount, 0);
  const ogUrl = `/api/og?name=${encodeURIComponent(mp.name)}&sub=${encodeURIComponent(
    `${mp.party} · ${mp.constituency}`,
  )}&amount=${encodeURIComponent(formatCompactINR(total))}`;
  const title = `${mp.name} — public spending`;
  return {
    title,
    description: `${formatCompactINR(total)} tracked across ${expenditures.length} records for ${mp.name} (${mp.constituency}).`,
    openGraph: { title, images: [ogUrl] },
    twitter: { card: "summary_large_image", images: [ogUrl] },
  };
}

export default async function MpPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { mp, expenditures, isDemo } = await getMpBySlug(slug);
  if (!mp) notFound();

  const stats = computeStats(expenditures);
  const total = formatCompactINR(stats.total);

  return (
    <div className="space-y-5">
      {isDemo && <DemoBanner />}

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-start gap-4">
          <MpAvatar mp={mp} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">{mp.name}</h1>
            <p className="text-sm text-slate-600">
              {mp.party} · {mp.house}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
              <Icon name="map-pin" />{" "}
              {mp.constituency ? `${mp.constituency}, ${mp.state}` : mp.state}
            </p>
          </div>
          <ShareButton
            url={`/mp/${mp.slug}`}
            text={`${mp.name}: ${total} of public money tracked on PaisaWatch.`}
            compact
          />
        </div>
        {mp.bio && <p className="mt-4 text-sm text-slate-700">{mp.bio}</p>}
      </section>

      <StatTiles stats={stats} />

      <SubscribeForm
        scope="mp"
        scopeValue={mp.id}
        label={`Get alerted on new data for ${mp.name}`}
      />

      <section>
        <h2 className="mb-3 text-base font-semibold">Spending records</h2>
        {expenditures.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            No spending records yet.
          </p>
        ) : (
          <div className="space-y-3">
            {expenditures.map((item) => (
              <ExpenditureCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <Comments stateSlug={mp.slug} stateName={mp.name} />
    </div>
  );
}

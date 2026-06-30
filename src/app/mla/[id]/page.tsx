import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMla } from "@/lib/mlas";
import { buildScorecard } from "@/lib/reps";
import { MpAvatar } from "@/components/MpAvatar";
import { PartyChip } from "@/components/PartyChip";
import { LatestNews } from "@/components/LatestNews";
import { SatisfactionPoll } from "@/components/SatisfactionPoll";
import { Comments } from "@/components/Comments";
import { ShareButton } from "@/components/ShareButton";
import { Icon } from "@/components/Icon";
import { InfoTip } from "@/components/InfoTip";
import { BackLink } from "@/components/BackLink";
import { JsonLd } from "@/components/JsonLd";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const mla = getMla(id);
  if (!mla) return { title: "MLA not found" };
  return {
    title: `${mla.name} — MLA affidavit`,
    description: `${mla.party} · ${mla.constituency}, ${mla.state}. Self-declared affidavit facts (ADR/MyNeta).`,
  };
}

const TONE: Record<string, string> = {
  neutral: "text-slate-900",
  info: "text-blue-700",
  warn: "text-amber-700",
  good: "text-emerald-700",
};

export default async function MlaPage({ params }: { params: Params }) {
  const { id } = await params;
  const mla = getMla(id);
  if (!mla) notFound();

  const scorecard = buildScorecard(mla);

  return (
    <div className="space-y-5">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: mla.name,
          jobTitle: "Member of Legislative Assembly (MLA)",
          affiliation: { "@type": "PoliticalParty", name: mla.party },
          ...(mla.state ? { workLocation: { "@type": "Place", name: `${mla.constituency}, ${mla.state}` } } : {}),
        }}
      />
      <BackLink fallback="/mlas" />
      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-start gap-4">
          <MpAvatar mp={{ name: mla.name, photoUrl: mla.photoUrl }} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">{mla.name}</h1>
            <div className="mt-1">
              <PartyChip party={mla.party} full />
            </div>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
              <Icon name="map-pin" /> {mla.constituency}, {mla.state} · MLA
            </p>
          </div>
          <ShareButton
            url={`/mla/${mla.id}`}
            text={`${mla.name} (${mla.party}, ${mla.constituency}) — MLA affidavit facts on PaisaWatch.`}
            compact
          />
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <Icon name="file-certificate" className="mt-0.5 text-emerald-600" />
        <p>
          Facts below are <span className="font-semibold">self-declared</span> in the 2024 election
          affidavit, compiled by{" "}
          <a className="underline" href={mla.sourceUrl} target="_blank" rel="noopener noreferrer">ADR / MyNeta</a>.
          Pending cases are <strong>not</strong> convictions.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold">Affidavit scorecard</h2>
        <div className="divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-200">
          {scorecard.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  {item.label}
                  {item.def && <InfoTip text={item.def} label={item.label} />}
                </div>
                {item.note && <div className="mt-0.5 text-xs text-slate-400">{item.note}</div>}
              </div>
              <div className={`shrink-0 text-right text-sm font-semibold ${TONE[item.tone]}`}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                    {item.value} <Icon name="external-link" />
                  </a>
                ) : (
                  item.value
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          MLAs have no PRS attendance/performance data and MLALAD (local-area development) spending
          isn&apos;t published as open data, so this profile is affidavit-only.
        </p>
      </section>

      <SatisfactionPoll subject={`mla-${mla.id}`} />

      <LatestNews name={mla.name} context={mla.constituency} />

      <Comments stateSlug={`mla-${mla.id}`} stateName={mla.name} />
    </div>
  );
}

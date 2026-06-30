import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getRep, buildScorecard, activityIndex, REPS_SOURCE } from "@/lib/reps";
import { MpAvatar } from "@/components/MpAvatar";
import { PartyChip } from "@/components/PartyChip";
import { ScoreDonut, type DonutSegment } from "@/components/ScoreDonut";
import { InfoTip } from "@/components/InfoTip";
import { BackLink } from "@/components/BackLink";
import { JsonLd } from "@/components/JsonLd";
import { ConstituencyMap } from "@/components/ConstituencyMap";
import { LatestNews } from "@/components/LatestNews";
import { SatisfactionPoll } from "@/components/SatisfactionPoll";
import { Comments } from "@/components/Comments";
import { ShareButton } from "@/components/ShareButton";
import { Icon } from "@/components/Icon";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const rep = getRep(id);
  if (!rep) return { title: "MP not found" };
  return {
    title: `${rep.name} — affidavit & scorecard`,
    description: `${rep.party} · ${rep.constituency}. Self-declared affidavit facts (ADR/MyNeta).`,
  };
}

const TONE: Record<string, string> = {
  neutral: "text-slate-900",
  info: "text-blue-700",
  warn: "text-amber-700",
  good: "text-emerald-700",
};

export default async function RepPage({ params }: { params: Params }) {
  const { id } = await params;
  const rep = getRep(id);
  if (!rep) notFound();

  const scorecard = buildScorecard(rep);
  const score = activityIndex(rep);
  const p = rep.prs;
  const segments: DonutSegment[] =
    p && p.attendance != null
      ? [
          { label: "Attendance", raw: `${p.attendance}%`, normalized: Math.min(1, p.attendance / 100), color: "#2563eb" },
          {
            label: "Debates",
            raw: String(p.debates ?? 0),
            normalized: p.natDebates ? Math.min(1, (p.debates ?? 0) / (p.natDebates * 2)) : 0,
            color: "#7c3aed",
          },
          {
            label: "Questions",
            raw: String(p.questions ?? 0),
            normalized: p.natQuestions ? Math.min(1, (p.questions ?? 0) / (p.natQuestions * 2)) : 0,
            color: "#0d9488",
          },
        ]
      : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: rep.name,
          jobTitle: "Member of Parliament (Lok Sabha)",
          affiliation: { "@type": "PoliticalParty", name: rep.party },
          memberOf: { "@type": "GovernmentOrganization", name: "Lok Sabha, India" },
          ...(rep.constituency ? { workLocation: { "@type": "Place", name: rep.constituency } } : {}),
        }}
      />
      <BackLink fallback="/reps" />
      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-start gap-4">
          <MpAvatar mp={{ name: rep.name, photoUrl: rep.photoUrl }} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">{rep.name}</h1>
            <div className="mt-1">
              <PartyChip party={rep.party} full />
            </div>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
              <Icon name="map-pin" /> {rep.constituency} · Lok Sabha 2024
            </p>
          </div>
          <ShareButton
            url={`/rep/${rep.id}`}
            text={`${rep.name} (${rep.party}, ${rep.constituency}) — affidavit facts on PaisaWatch.`}
            compact
          />
        </div>
        {score != null && segments.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Activity index
            </div>
            <ScoreDonut score={score} segments={segments} />
            <p className="mt-3 text-xs text-slate-400">
              Mechanical composite of PRS attendance, debates &amp; questions vs national
              averages — not a rating of merit. Hover a slice for detail.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <Icon name="file-certificate" className="mt-0.5 text-emerald-600" />
        <p>
          Facts below are <span className="font-semibold">self-declared</span> by the MP in their
          2024 election affidavit, compiled by{" "}
          <a className="underline" href={rep.sourceUrl} target="_blank" rel="noopener noreferrer">ADR / MyNeta</a>.
          Pending cases are <strong>not</strong> convictions.
        </p>
      </div>

      <ConstituencyMap constituency={rep.constituency} />

      {rep.stateSlug && rep.state && (
        <Link
          href={`/mp/${rep.stateSlug}`}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 hover:ring-slate-300"
        >
          <Icon name="building-bank" className="text-emerald-600" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-800">
              MPLADS spending in {rep.state}
            </div>
            <div className="text-xs text-slate-500">
              Each Lok Sabha MP has a ₹5 crore/year MPLADS entitlement. See the state&apos;s
              works spending →
            </div>
          </div>
          <Icon name="chevron-right" className="text-slate-400" />
        </Link>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">Scorecard — affidavit & performance</h2>
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
          A factual summary from the public affidavit — not a rating of performance or merit. For
          the full affidavit, open the source link above. Data scraped{" "}
          {new Date(REPS_SOURCE.scrapedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.
        </p>
      </section>

      <SatisfactionPoll subject={`rep-${rep.id}`} />

      <LatestNews name={rep.name} context={rep.constituency} />

      <Comments stateSlug={`rep-${rep.id}`} stateName={rep.name} />
    </div>
  );
}

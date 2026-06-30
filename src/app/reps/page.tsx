import Link from "next/link";
import type { Metadata } from "next";
import { getReps, getParties, getRepStates, getEducationLevels, getRepStats, activityIndex, REPS_SOURCE, type RepFilters as Filters } from "@/lib/reps";
import { formatCompactINR } from "@/lib/format";
import { RepFilters } from "@/components/RepFilters";
import { MpAvatar } from "@/components/MpAvatar";
import { PartyChip } from "@/components/PartyChip";
import { Icon } from "@/components/Icon";
import { InfoTip } from "@/components/InfoTip";
import { DEFS } from "@/lib/definitions";

function scoreTone(score: number): string {
  if (score >= 60) return "bg-emerald-100 text-emerald-700";
  if (score >= 35) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export const metadata: Metadata = {
  title: "MPs (Lok Sabha 2024)",
  description: "Profiles of sitting Lok Sabha MPs from their public election affidavits (ADR / MyNeta).",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function RepsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const csv = (v: string | string[] | undefined) => {
    const s = one(v);
    return s ? s.split(",").filter(Boolean) : undefined;
  };
  const numParam = (v: string | string[] | undefined) => (one(v) ? Number(one(v)) : undefined);
  const filters: Filters = {
    search: one(params.q) || undefined,
    parties: csv(params.party),
    states: csv(params.state),
    educations: csv(params.edu),
    categories: csv(params.cat),
    minAssets: numParam(params.minAssets),
    minLiabilities: numParam(params.minLiab),
    minAttendance: numParam(params.minAtt),
    minQuestions: numParam(params.minQ),
    minDebates: numParam(params.minDeb),
    minActivity: numParam(params.minAct),
    withCasesOnly: one(params.cases) === "1",
    cleanOnly: one(params.clean) === "1",
    netWorthPositive: one(params.networth) === "1",
    hasPrs: one(params.prs) === "1",
    sort: (one(params.sort) as Filters["sort"]) || "name",
  };

  const reps = getReps(filters);
  const stats = getRepStats();
  const parties = getParties();
  const states = getRepStates();
  const educationLevels = getEducationLevels();

  const tiles = [
    { label: "MPs analysed", value: stats.total.toLocaleString("en-IN"), def: DEFS.coverage },
    { label: "With declared cases", value: stats.withCases.toLocaleString("en-IN"), accent: "text-amber-600", def: DEFS.declaredCases },
    { label: "Crorepati MPs", value: stats.withSeriousAssets.toLocaleString("en-IN"), def: DEFS.crorepati },
    { label: "Median assets", value: formatCompactINR(stats.medianAssets), def: DEFS.assets },
  ];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Members of Parliament</h1>
        <p className="mt-1 text-sm text-slate-600">
          Lok Sabha 2024 winners, from their public election affidavits.
        </p>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <Icon name="file-certificate" className="mt-0.5 text-emerald-600" />
        <p>
          <span className="font-semibold">Real, source-linked data:</span> affidavit facts from{" "}
          <a className="underline" href="https://myneta.info/LokSabha2024/" target="_blank" rel="noopener noreferrer">ADR / MyNeta</a>{" "}
          and performance from{" "}
          <a className="underline" href="https://prsindia.org/mptrack/18th-lok-sabha" target="_blank" rel="noopener noreferrer">PRS</a>.
          Covers the {stats.total} of 543 Lok Sabha MPs whose affidavits ADR has analysed (the rest
          aren&apos;t published, so we don&apos;t guess them). &ldquo;Cases&rdquo; are <strong>pending</strong> — not convictions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className={`text-2xl font-semibold ${t.accent ?? "text-slate-900"}`}>{t.value}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              {t.label}
              <InfoTip text={t.def} label={t.label} />
            </div>
          </div>
        ))}
      </div>

      <RepFilters parties={parties} states={states} educationLevels={educationLevels} />

      <p className="text-xs text-slate-500">{reps.length} MPs</p>

      <div className="space-y-3">
        {reps.slice(0, 120).map((rep) => {
          const score = activityIndex(rep);
          return (
            <Link
              key={rep.id}
              href={`/rep/${rep.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 hover:ring-slate-300"
            >
              <MpAvatar mp={{ name: rep.name, photoUrl: rep.photoUrl }} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-slate-900">{rep.name}</span>
                  {score != null && (
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold ${scoreTone(score)}`}>
                      {score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <PartyChip party={rep.party} />
                  <span className="shrink-0">· {rep.constituency}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">{formatCompactINR(rep.assets)}</div>
                <div className="text-xs text-slate-500">
                  {rep.criminalCases > 0 ? (
                    <span className="text-amber-600">{rep.criminalCases} declared case{rep.criminalCases > 1 ? "s" : ""}</span>
                  ) : (
                    "No declared cases"
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {reps.length > 120 && (
        <p className="text-center text-xs text-slate-500">Showing first 120 — refine with search or filters.</p>
      )}
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getMlas, getMlaParties, getMlaEducationLevels, getMlaStateNames, getMlaStats, stateNameToSlug } from "@/lib/mlas";
import type { MlaFilters as Filters } from "@/lib/mlas";
import { formatCompactINR } from "@/lib/format";
import { MlaFilters } from "@/components/MlaFilters";
import { MpAvatar } from "@/components/MpAvatar";
import { PartyChip } from "@/components/PartyChip";
import { Icon } from "@/components/Icon";
import { InfoTip } from "@/components/InfoTip";
import { DEFS } from "@/lib/definitions";

export const metadata: Metadata = {
  title: "MLAs",
  description: "State legislative assembly members from their public election affidavits (ADR / MyNeta).",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function MlasPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const csv = (v: string | string[] | undefined) => {
    const s = one(v);
    return s ? s.split(",").filter(Boolean) : undefined;
  };
  const stateSlugs = csv(params.state)
    ?.map((name) => stateNameToSlug(name))
    .filter((s): s is string => Boolean(s));
  const filters: Filters = {
    search: one(params.q) || undefined,
    states: stateSlugs,
    parties: csv(params.party),
    educations: csv(params.edu),
    categories: csv(params.cat),
    minAssets: one(params.minAssets) ? Number(one(params.minAssets)) : undefined,
    withCasesOnly: one(params.cases) === "1",
    sort: (one(params.sort) as Filters["sort"]) || "name",
  };

  const mlas = getMlas(filters);
  const stats = getMlaStats();
  const parties = getMlaParties();
  const educationLevels = getMlaEducationLevels();
  const stateNames = getMlaStateNames();

  const tiles = [
    { label: "MLAs analysed", value: stats.total.toLocaleString("en-IN"), def: DEFS.coverage },
    { label: "States & UTs", value: stats.states.toLocaleString("en-IN"), def: "States and union territories whose sitting assembly we cover." },
    { label: "With declared cases", value: stats.withCases.toLocaleString("en-IN"), accent: "text-amber-600", def: DEFS.declaredCases },
    { label: "Crorepati MLAs", value: stats.crorepatis.toLocaleString("en-IN"), def: DEFS.crorepati },
  ];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">MLAs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sitting state-assembly members across {stats.states} states &amp; UTs, from their public
          election affidavits.
        </p>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <Icon name="file-certificate" className="mt-0.5 text-emerald-600" />
        <p>
          <span className="font-semibold">Self-declared affidavit data</span> from{" "}
          <a className="underline" href="https://myneta.info" target="_blank" rel="noopener noreferrer">ADR / MyNeta</a>,
          each profile source-linked to its own affidavit. This is the {stats.total.toLocaleString("en-IN")} of
          ~4,120 sitting MLAs whose affidavits ADR has analysed; the rest have no published affidavit, so we
          don&apos;t guess them. &ldquo;Cases&rdquo; are <strong>pending</strong>, not convictions.
          MLAs have no PRS performance data, so no activity score.
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

      <MlaFilters parties={parties} educationLevels={educationLevels} states={stateNames} />

      <p className="text-xs text-slate-500">{mlas.length} MLAs</p>

      <div className="space-y-3">
        {mlas.slice(0, 120).map((mla) => (
          <Link
            key={mla.id}
            href={`/mla/${mla.id}`}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 hover:ring-slate-300"
          >
            <MpAvatar mp={{ name: mla.name, photoUrl: mla.photoUrl }} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-slate-900">{mla.name}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <PartyChip party={mla.party} />
                <span className="shrink-0">· {mla.constituency}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{formatCompactINR(mla.assets)}</div>
              <div className="text-xs text-slate-500">
                {mla.criminalCases > 0 ? (
                  <span className="text-amber-600">{mla.criminalCases} declared case{mla.criminalCases > 1 ? "s" : ""}</span>
                ) : (
                  "No declared cases"
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {mlas.length > 120 && (
        <p className="text-center text-xs text-slate-500">Showing first 120, refine with search or filters.</p>
      )}
    </div>
  );
}

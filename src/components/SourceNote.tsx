import { Icon } from "./Icon";
import { DATA_SOURCES } from "@/lib/constants";

// Attribution shown when the feed is backed by the live data.gov.in source.
export function SourceNote() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      <Icon name="database" className="mt-0.5 text-emerald-600" />
      <p>
        <span className="font-semibold">Live official data.</span> MPLADS
        public-works spending from{" "}
        <a
          href={DATA_SOURCES.catalogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          data.gov.in
        </a>{" "}
        (Ministry of Statistics &amp; Programme Implementation), FY2016-17 to
        FY2019-20. State totals are official; the per-sector split applies each
        state&apos;s reported mix.
      </p>
    </div>
  );
}

import { Icon } from "./Icon";

// Shown whenever the data on screen is the fictional demo set rather than live
// records from the database. Keeps the public from mistaking sample numbers for
// real spending.
export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Icon name="alert-triangle" className="mt-0.5 text-amber-600" />
      <p>
        <span className="font-semibold">Sample data.</span> The live
        data.gov.in feed could not be reached, so placeholder figures are shown.
        Refresh to retry, real records resume automatically once the source is
        reachable.
      </p>
    </div>
  );
}

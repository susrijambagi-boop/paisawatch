import { InfoTip } from "./InfoTip";

export interface HBarItem {
  label: string;
  value: number;
  display: string;
  def?: string;
}

// Simple horizontal bar list (server-rendered). Bar width is relative to the
// largest value in the set.
export function HBars({ items, color = "#10b981" }: { items: HBarItem[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-3 text-sm">
          <span className="flex w-40 shrink-0 items-center gap-1 truncate text-slate-600 sm:w-52">
            <span className="truncate">{i.label}</span>
            {i.def && <InfoTip text={i.def} label={i.label} />}
          </span>
          <span className="h-3 flex-1 overflow-hidden rounded bg-slate-100">
            <span
              className="block h-full rounded"
              style={{ width: `${Math.max(2, (i.value / max) * 100)}%`, background: color }}
            />
          </span>
          <span className="w-20 shrink-0 text-right font-medium text-slate-700">{i.display}</span>
        </div>
      ))}
    </div>
  );
}

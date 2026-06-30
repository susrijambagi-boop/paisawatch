import type { Stats } from "@/lib/data";
import { CountUp } from "./CountUp";

export function StatTiles({ stats }: { stats: Stats }) {
  const tiles: Array<{ label: string; value: number; format: "compactINR" | "int"; accent?: string }> = [
    { label: "Total tracked", value: stats.total, format: "compactINR" },
    { label: "Transactions", value: stats.count, format: "int" },
    { label: "Large (≥₹20cr)", value: stats.highRisk, format: "int", accent: "text-blue-600" },
    { label: "States & UTs", value: stats.mpCount, format: "int" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-xl bg-white p-4 ring-1 ring-slate-200 transition hover:ring-slate-300"
        >
          <div className={`text-2xl font-semibold ${t.accent ?? "text-slate-900"}`}>
            <CountUp value={t.value} format={t.format} />
          </div>
          <div className="mt-0.5 text-xs text-slate-500">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

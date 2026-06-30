"use client";

import { useMemo, useState } from "react";
import { estimateTax, TAX_YEAR } from "@/lib/tax";
import { RUPEE_GOES_TO, BUDGET_YEAR } from "@/data/budget";
import { formatINR } from "@/lib/format";
import { Icon } from "./Icon";

// Enter income -> estimated tax -> how that tax maps onto the Union Budget's
// "rupee goes to" composition. A rough, illustrative estimate, clearly labelled.
export function TaxEstimator() {
  const [income, setIncome] = useState(1200000);
  const result = useMemo(() => estimateTax(income), [income]);

  const allocation = useMemo(
    () => RUPEE_GOES_TO.map((s) => ({ ...s, amount: Math.round((result.total * s.pct) / 100) })),
    [result.total],
  );

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <label className="block text-sm font-medium text-slate-700">Your annual income</label>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-slate-400">₹</span>
        <input
          type="number"
          min={0}
          step={50000}
          value={income}
          onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
          className="w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <input
          type="range"
          min={0}
          max={5000000}
          step={50000}
          value={Math.min(income, 5000000)}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="flex-1 accent-emerald-600"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-lg font-semibold text-slate-900">{formatINR(result.total)}</div>
          <div className="text-xs text-slate-500">Estimated tax (incl. cess)</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-lg font-semibold text-slate-900">{result.effectiveRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Effective rate</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-lg font-semibold text-emerald-700">{formatINR(income - result.total)}</div>
          <div className="text-xs text-slate-500">In hand (of income)</div>
        </div>
      </div>

      {result.total > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-slate-700">Where that tax goes</div>
          <ul className="space-y-1.5 text-sm">
            {allocation.map((a) => (
              <li key={a.label} className="flex items-center gap-2">
                <span className="text-slate-600">{a.label}</span>
                <span className="ml-auto text-xs text-slate-400">{a.pct}%</span>
                <span className="w-24 text-right font-medium text-slate-800">{formatINR(a.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          At this income, estimated income tax is ₹0 under the new regime (after the standard
          deduction and the section 87A rebate).
        </p>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Rough estimate, {TAX_YEAR}, salaried — before surcharge and other income/deductions; not tax
        advice. Allocation applies the Union Budget {BUDGET_YEAR} &ldquo;rupee goes to&rdquo;
        composition to your estimated tax.
      </p>
    </div>
  );
}

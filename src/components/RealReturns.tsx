"use client";

import { useMemo, useState } from "react";
import { ASSET_DEFAULTS, DEFAULT_INFLATION, DEFAULT_SLAB, RETURNS_SOURCE } from "@/data/asset-returns";
import { formatINR, formatCompactINR } from "@/lib/format";

const pow = (base: number, exp: number) => Math.pow(base, exp);

// "Is it actually growing?", compares nominal vs inflation-adjusted (real)
// returns for salary and major asset classes. Every rate is editable.
export function RealReturns() {
  const [inflation, setInflation] = useState(DEFAULT_INFLATION);

  // --- Salary reality check ---
  const [salaryThen, setSalaryThen] = useState(500000);
  const [salaryNow, setSalaryNow] = useState(800000);
  const [years, setYears] = useState(5);

  const salary = useMemo(() => {
    const infFactor = pow(1 + inflation / 100, years);
    const realNow = salaryNow / infFactor; // today's salary in "then" rupees
    const realChangePct = (realNow / salaryThen - 1) * 100;
    const nominalCagr = years > 0 ? (pow(salaryNow / salaryThen, 1 / years) - 1) * 100 : 0;
    const realCagr = ((1 + nominalCagr / 100) / (1 + inflation / 100) - 1) * 100;
    return { realNow, realChangePct, nominalCagr, realCagr };
  }, [salaryThen, salaryNow, years, inflation]);

  // --- Asset returns ---
  const [amount, setAmount] = useState(1000000);
  const [horizon, setHorizon] = useState(10);
  const [slab, setSlab] = useState(DEFAULT_SLAB);
  const [rates, setRates] = useState<Record<string, number>>(
    Object.fromEntries(ASSET_DEFAULTS.map((a) => [a.key, a.rate])),
  );

  const assets = useMemo(() => {
    const infFactor = pow(1 + inflation / 100, horizon);
    return ASSET_DEFAULTS.map((a) => {
      const rate = rates[a.key];
      const grossNominal = amount * pow(1 + rate / 100, horizon);

      // Apply current tax treatment.
      let postTax: number;
      if (a.taxType === "exempt") {
        postTax = grossNominal;
      } else if (a.taxType === "ltcg") {
        const gain = Math.max(0, grossNominal - amount);
        postTax = grossNominal - gain * ((a.ltcgRate ?? 0) / 100);
      } else {
        // interest taxed yearly at the slab -> lower effective compounding rate
        const net = rate * (1 - slab / 100);
        postTax = amount * pow(1 + net / 100, horizon);
      }

      const real = postTax / infFactor; // post-tax, inflation-adjusted
      const totalRoi = (real / amount - 1) * 100; // net real total return
      const annualRoi = horizon > 0 ? (pow(real / amount, 1 / horizon) - 1) * 100 : 0;
      return { ...a, rate, postTax, real, totalRoi, annualRoi, beats: real >= amount };
    });
  }, [amount, horizon, rates, inflation, slab]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 p-4 text-white">
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Assumed inflation (CPI)</span>
          <input
            type="number"
            value={inflation}
            step={0.5}
            onChange={(e) => setInflation(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm outline-none"
          />
          <span className="text-slate-300">% per year</span>
          <input
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={inflation}
            onChange={(e) => setInflation(Number(e.target.value))}
            className="ml-auto w-40 accent-emerald-500"
          />
        </label>
      </div>

      {/* Salary reality check */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Is your salary really growing?</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Salary X years ago" value={salaryThen} onChange={setSalaryThen} prefix="₹" />
          <Field label="Salary now" value={salaryNow} onChange={setSalaryNow} prefix="₹" />
          <Field label="Years between" value={years} onChange={(v) => setYears(Math.max(1, v))} />
        </div>

        <div
          className={`mt-4 rounded-xl p-4 ${
            salary.realChangePct >= 0 ? "bg-emerald-50" : "bg-red-50"
          }`}
        >
          <div className={`text-2xl font-semibold ${salary.realChangePct >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {salary.realChangePct >= 0 ? "+" : ""}
            {salary.realChangePct.toFixed(1)}%
          </div>
          <p className="mt-1 text-sm text-slate-600">
            In real terms, your salary has {salary.realChangePct >= 0 ? "grown" : "shrunk"} by{" "}
            {Math.abs(salary.realChangePct).toFixed(1)}% after inflation. Your {formatINR(salaryNow)}{" "}
            today is worth about <strong>{formatINR(salary.realNow)}</strong> in the money of {years} year
            {years === 1 ? "" : "s"} ago.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Nominal raise: {salary.nominalCagr.toFixed(1)}%/yr · Real (after inflation):{" "}
            <span className={salary.realCagr >= 0 ? "text-emerald-700" : "text-red-700"}>
              {salary.realCagr.toFixed(1)}%/yr
            </span>
          </p>
        </div>
      </div>

      {/* Asset returns */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Will your investment beat inflation?</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Amount invested" value={amount} onChange={setAmount} prefix="₹" />
          <Field label="Held for (years)" value={horizon} onChange={(v) => setHorizon(Math.max(1, v))} />
          <Field label="Your income-tax slab %" value={slab} onChange={(v) => setSlab(Math.max(0, v))} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="py-2 font-medium">Asset</th>
                <th className="py-2 font-medium">Return %/yr</th>
                <th className="py-2 font-medium">Tax</th>
                <th className="py-2 text-right font-medium">After-tax value</th>
                <th className="py-2 text-right font-medium">Real value</th>
                <th className="py-2 text-right font-medium">Total ROI (real, net)</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.key} className="border-t border-slate-50 align-top">
                  <td className="py-2">
                    <div className="font-medium text-slate-800">{a.label}</div>
                    <div className="text-xs text-slate-400">{a.note}</div>
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={a.rate}
                      step={0.5}
                      onChange={(e) => setRates((r) => ({ ...r, [a.key]: Number(e.target.value) }))}
                      className="w-16 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:border-slate-400"
                    />
                  </td>
                  <td className="py-2 text-xs text-slate-500">{a.taxNote}</td>
                  <td className="py-2 text-right text-slate-700">{formatCompactINR(a.postTax)}</td>
                  <td className="py-2 text-right text-slate-700">{formatCompactINR(a.real)}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.beats ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.totalRoi >= 0 ? "+" : ""}
                      {a.totalRoi.toFixed(0)}%
                    </span>
                    <div className="mt-0.5 text-xs text-slate-400">{a.annualRoi.toFixed(1)}%/yr</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          <strong>After-tax value</strong> applies each asset&apos;s current tax. <strong>Real value</strong>{" "}
          is that in today&apos;s money. <strong>Total ROI (real, net)</strong> is your net return after
          both tax and inflation over the period (green = grows your wealth, red = shrinks it).{" "}
          {RETURNS_SOURCE}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="mt-1 flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2">
        {prefix && <span className="text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full text-sm outline-none"
        />
      </span>
    </label>
  );
}

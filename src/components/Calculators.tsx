"use client";

import { useMemo, useState } from "react";
import { emi, sip } from "@/lib/calc";
import { estimateTax } from "@/lib/tax";
import { formatINR, formatCompactINR } from "@/lib/format";

function Field({ label, value, onChange, prefix }: { label: string; value: number; onChange: (v: number) => void; prefix?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="mt-1 flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2">
        {prefix && <span className="text-slate-400">{prefix}</span>}
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full text-sm outline-none" />
      </span>
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className={`text-lg font-semibold ${accent ?? "text-slate-900"}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      <p className="mb-4 mt-0.5 text-xs text-slate-500">{subtitle}</p>
      {children}
    </section>
  );
}

export function EmiCalculator() {
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const r = useMemo(() => emi(amount, rate, years), [amount, rate, years]);
  return (
    <Card title="Loan EMI" subtitle="Your monthly payment, and how much of it is just interest.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Loan amount" value={amount} onChange={setAmount} prefix="₹" />
        <Field label="Interest rate %/yr" value={rate} onChange={setRate} />
        <Field label="Tenure (years)" value={years} onChange={(v) => setYears(Math.max(1, v))} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Monthly EMI" value={formatINR(r.emi)} />
        <Stat label="Total interest" value={formatCompactINR(r.totalInterest)} accent="text-amber-600" />
        <Stat label="Total paid" value={formatCompactINR(r.totalPaid)} />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Over {years} years you repay {formatCompactINR(r.totalPaid)} on a {formatCompactINR(amount)} loan —{" "}
        {Math.round((r.totalInterest / amount) * 100)}% of the loan again, in interest.
      </p>
    </Card>
  );
}

export function SipCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(20);
  const [inflation, setInflation] = useState(6);
  const r = useMemo(() => sip(monthly, rate, years, inflation), [monthly, rate, years, inflation]);
  return (
    <Card title="SIP / monthly investing" subtitle="What small monthly investments grow into — and their real, inflation-adjusted worth.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Monthly investment" value={monthly} onChange={setMonthly} prefix="₹" />
        <Field label="Return %/yr" value={rate} onChange={setRate} />
        <Field label="Years" value={years} onChange={(v) => setYears(Math.max(1, v))} />
        <Field label="Inflation %/yr" value={inflation} onChange={setInflation} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Future value" value={formatCompactINR(r.futureValue)} accent="text-emerald-700" />
        <Stat label="You invest" value={formatCompactINR(r.invested)} />
        <Stat label="Gains" value={formatCompactINR(r.gains)} accent="text-emerald-700" />
        <Stat label="In today's money" value={formatCompactINR(r.real)} />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {formatINR(monthly)}/month for {years} years becomes {formatCompactINR(r.futureValue)} — worth about{" "}
        {formatCompactINR(r.real)} in today&apos;s money after inflation. Illustrative; returns aren&apos;t guaranteed.
      </p>
    </Card>
  );
}

export function LifetimeTaxCalculator() {
  const [income, setIncome] = useState(1200000);
  const [raise, setRaise] = useState(8);
  const [years, setYears] = useState(30);
  const result = useMemo(() => {
    let total = 0;
    let inc = income;
    for (let y = 0; y < years; y++) {
      total += estimateTax(inc).total;
      inc *= 1 + raise / 100;
    }
    return Math.round(total);
  }, [income, raise, years]);
  return (
    <Card title="Your lifetime tax contribution" subtitle="Roughly what you'll hand to the nation over a working life — the roads, schools and defence you help pay for.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Current annual income" value={income} onChange={setIncome} prefix="₹" />
        <Field label="Annual raise %" value={raise} onChange={setRaise} />
        <Field label="Working years left" value={years} onChange={(v) => setYears(Math.max(1, v))} />
      </div>
      <div className="mt-4 rounded-xl bg-emerald-50 p-4">
        <div className="text-2xl font-semibold text-emerald-700">{formatCompactINR(result)}</div>
        <p className="mt-1 text-sm text-slate-600">
          Over {years} years you&apos;ll contribute about <strong>{formatCompactINR(result)}</strong> in income
          tax — money that builds roads, funds schools and defends the country. That&apos;s exactly why where it
          goes should be public.
        </p>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Rough estimate, FY2025-26 new regime, income growing at your assumed raise. Not tax advice.
      </p>
    </Card>
  );
}

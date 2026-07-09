import type { Metadata } from "next";
import { TaxEstimator } from "@/components/TaxEstimator";
import { RealReturns } from "@/components/RealReturns";
import { EmiCalculator, SipCalculator, LifetimeTaxCalculator } from "@/components/Calculators";

export const metadata: Metadata = {
  title: "Money calculators",
  description:
    "Free Indian money calculators, income tax, EMI, SIP, real returns vs inflation, and your lifetime tax contribution. The tools everyone needs, in plain numbers.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Money calculators</h1>
        <p className="mt-1 text-sm text-slate-600">
          The everyday-money questions most people never sit down to answer, in plain numbers, free,
          with nothing hidden. Every rate is editable, so you can use your own figures.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Income tax</h2>
        <TaxEstimator />
      </section>

      <LifetimeTaxCalculator />

      <EmiCalculator />

      <SipCalculator />

      <section>
        <h2 className="text-base font-semibold">Is your money beating inflation?</h2>
        <p className="mb-3 mt-1 text-xs text-slate-500">
          Salary, FD, equity, gold, real estate, after tax and inflation, is it actually growing?
        </p>
        <RealReturns />
      </section>
    </div>
  );
}

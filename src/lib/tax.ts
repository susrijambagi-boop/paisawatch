// A rough income-tax estimate under the FY2025-26 (AY2026-27) NEW regime.
// Illustrative only, real liability depends on regime choice, deductions,
// surcharge, and other income. Figures per Union Budget 2025-26.

export const TAX_YEAR = "FY2025-26 (new regime)";
export const STANDARD_DEDUCTION = 75_000; // salaried
const REBATE_LIMIT = 1_200_000; // 87A: nil tax up to ₹12L taxable
const CESS_RATE = 0.04; // health & education cess

// [upper bound of slab, marginal rate]
const SLABS: ReadonlyArray<[number, number]> = [
  [400_000, 0],
  [800_000, 0.05],
  [1_200_000, 0.1],
  [1_600_000, 0.15],
  [2_000_000, 0.2],
  [2_400_000, 0.25],
  [Infinity, 0.3],
];

export interface TaxResult {
  taxable: number;
  baseTax: number;
  cess: number;
  total: number;
  effectiveRate: number; // % of gross income
}

export function estimateTax(grossAnnualIncome: number): TaxResult {
  const taxable = Math.max(0, grossAnnualIncome - STANDARD_DEDUCTION);

  let baseTax = 0;
  let prev = 0;
  for (const [upper, rate] of SLABS) {
    if (taxable <= prev) break;
    baseTax += (Math.min(taxable, upper) - prev) * rate;
    prev = upper;
  }

  // Section 87A rebate makes tax nil up to the rebate limit.
  if (taxable <= REBATE_LIMIT) baseTax = 0;

  const cess = baseTax * CESS_RATE;
  const total = Math.round(baseTax + cess);
  return {
    taxable,
    baseTax: Math.round(baseTax),
    cess: Math.round(cess),
    total,
    effectiveRate: grossAnnualIncome > 0 ? (total / grossAnnualIncome) * 100 : 0,
  };
}

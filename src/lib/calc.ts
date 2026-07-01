// Pure finance helpers for the calculators. Plain functions, easy to test.

export interface EmiResult {
  emi: number;
  totalPaid: number;
  totalInterest: number;
}

// Loan EMI (monthly). rate is annual %; years is tenure.
export function emi(principal: number, annualRatePct: number, years: number): EmiResult {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRatePct / 1200;
  const monthly = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = monthly * n;
  return { emi: Math.round(monthly), totalPaid: Math.round(totalPaid), totalInterest: Math.round(totalPaid - principal) };
}

export interface SipResult {
  futureValue: number;
  invested: number;
  gains: number;
  real: number; // inflation-adjusted future value
}

// SIP future value with monthly contributions at the start of each month.
export function sip(monthly: number, annualRatePct: number, years: number, inflationPct = 6): SipResult {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRatePct / 1200;
  const fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const real = fv / Math.pow(1 + inflationPct / 100, years);
  return { futureValue: Math.round(fv), invested: Math.round(invested), gains: Math.round(fv - invested), real: Math.round(real) };
}

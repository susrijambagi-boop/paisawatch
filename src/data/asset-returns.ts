// Representative long-run (~20-year) average ANNUAL nominal returns for major
// Indian asset classes, their current tax treatment, and long-run CPI inflation.
// Returns are editable defaults in the calculator, illustrative anchors, not a
// precise historical series. Tax rules are FY2025-26 (post Budget-2024 capital
// gains changes). Sources: MOSPI (CPI), BSE (Sensex), RBI/IBJA (gold),
// RBI House Price Index, Income-tax Act. Not investment or tax advice.

export type TaxType = "slab" | "ltcg" | "exempt";

export interface AssetDefault {
  key: string;
  label: string;
  rate: number; // % annual nominal
  note: string;
  taxType: TaxType;
  ltcgRate?: number; // % long-term capital gains rate (for taxType "ltcg")
  taxNote: string;
}

export const DEFAULT_INFLATION = 6; // % long-run CPI
export const DEFAULT_SLAB = 30; // % marginal income-tax slab (for interest)

export const ASSET_DEFAULTS: AssetDefault[] = [
  { key: "fd", label: "Fixed deposit", rate: 6.5, note: "Typical 1-year bank FD", taxType: "slab", taxNote: "Interest taxed at your income slab" },
  { key: "savings", label: "Savings account", rate: 3.5, note: "Typical savings rate", taxType: "slab", taxNote: "Interest taxed at slab (small exemption)" },
  { key: "equity", label: "Equity (Sensex)", rate: 12, note: "Long-run BSE Sensex average", taxType: "ltcg", ltcgRate: 12.5, taxNote: "LTCG 12.5% over ₹1.25L/yr (held >1yr)" },
  { key: "gold", label: "Gold", rate: 10, note: "Long-run gold price growth", taxType: "ltcg", ltcgRate: 12.5, taxNote: "LTCG 12.5% (held >2yr)" },
  { key: "realEstate", label: "Real estate", rate: 8, note: "RBI House Price Index, long-run", taxType: "ltcg", ltcgRate: 12.5, taxNote: "LTCG 12.5% without indexation" },
  { key: "ppf", label: "PPF", rate: 7.1, note: "Public Provident Fund", taxType: "exempt", taxNote: "Tax-free (EEE)" },
];

export const RETURNS_SOURCE =
  "Representative long-run averages from public data (MOSPI, BSE, RBI); tax per FY2025-26 rules. Editable, enter your own figures for a precise result. Not investment or tax advice.";

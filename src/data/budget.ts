// Official "Rupee comes from / Rupee goes to" composition of the Union Budget.
// Published proportions from the Ministry of Finance's "Budget at a Glance".
// Update YEAR + the two arrays each budget; every figure is verifiable against
// the linked source. (The Union Budget is annual — not a real-time series.)

export const BUDGET_YEAR = "2024-25";
export const BUDGET_SOURCE =
  "https://www.indiabudget.gov.in/ (Budget at a Glance, Ministry of Finance)";

export interface BudgetSlice {
  label: string;
  pct: number; // percentage points (the set sums to 100)
  def: string; // plain-language definition for the InfoTip
}

// Where the government's rupee comes from.
export const RUPEE_COMES_FROM: BudgetSlice[] = [
  { label: "Borrowings & other liabilities", pct: 27, def: "Money the government borrows (the fiscal deficit) plus other liabilities — spent now, repaid later with interest." },
  { label: "Income tax", pct: 19, def: "Direct tax that individuals pay on their income." },
  { label: "GST & other taxes", pct: 18, def: "Goods and Services Tax and other indirect taxes on goods and services." },
  { label: "Corporation tax", pct: 17, def: "Tax that companies pay on their profits." },
  { label: "Non-tax receipts", pct: 9, def: "Government income that isn't tax — dividends from public-sector firms, interest, fees, spectrum, etc." },
  { label: "Union excise duties", pct: 5, def: "Central excise duty, mainly on fuels like petrol and diesel." },
  { label: "Customs", pct: 4, def: "Duties charged on imported goods." },
  { label: "Non-debt capital receipts", pct: 1, def: "Receipts that don't add to debt — recovery of loans and sale (disinvestment) of public-sector stakes." },
];

// Where the government's rupee goes.
export const RUPEE_GOES_TO: BudgetSlice[] = [
  { label: "States' share of taxes & duties", pct: 21, def: "The constitutionally-mandated share of central taxes passed on to state governments." },
  { label: "Interest payments", pct: 19, def: "Interest the government pays on the money it has borrowed." },
  { label: "Central sector schemes", pct: 16, def: "Programmes fully funded and run by the central government." },
  { label: "Finance Commission & other transfers", pct: 9, def: "Grants to states recommended by the Finance Commission, plus other transfers." },
  { label: "Centrally sponsored schemes", pct: 8, def: "Programmes jointly funded by the centre and states (e.g. MGNREGA, PM-KISAN)." },
  { label: "Defence", pct: 8, def: "Spending on the armed forces — salaries, pensions and equipment." },
  { label: "Subsidies", pct: 6, def: "Support on food, fertiliser and fuel to keep prices affordable." },
  { label: "Pensions", pct: 4, def: "Pensions for retired government and defence personnel." },
  { label: "Other expenditure", pct: 9, def: "Remaining spending not covered by the categories above." },
];

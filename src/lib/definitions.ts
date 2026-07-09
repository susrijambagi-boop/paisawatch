// Single source of truth for plain-language definitions shown via <InfoTip>.
// Keep them short, neutral and factual.

export const DEFS = {
  // Spending / MPLADS
  mplads:
    "MPLADS: Members of Parliament Local Area Development Scheme. Each Lok Sabha MP can recommend up to ₹5 crore/year of public-works in their area. Figures here are state-and-sector totals from data.gov.in.",
  mpladsTracked:
    "Total MPLADS public-works expenditure we currently track, summed across states and sectors (data.gov.in, FY2016-17 to FY2019-20).",
  spendSize:
    "A neutral size label (Small / Medium / Large) based purely on the rupee amount, not a judgement of merit or wrongdoing.",

  // Affidavit facts
  assets:
    "Total assets the person declared in their election affidavit (movable + immovable). Self-reported on nomination, not independently audited.",
  liabilities: "Total loans and liabilities the person declared in their election affidavit.",
  netWorth: "Declared assets minus declared liabilities. A self-reported figure, not audited.",
  crorepati: "A representative whose self-declared assets are ₹1 crore or more.",
  declaredCases:
    "Criminal cases the person declared as PENDING in their election affidavit, i.e. charges, not convictions. Click a profile's figure to see the actual cases.",
  education: "Highest educational qualification the person declared in their affidavit.",
  category:
    "Constituency type: GEN (general), SC (reserved for Scheduled Castes), or ST (reserved for Scheduled Tribes).",

  // Performance (PRS, Lok Sabha only)
  attendance:
    "Share of Lok Sabha sittings the MP attended this term (PRS Legislative Research), shown against the national average.",
  debates: "Number of debates the MP participated in this term (PRS), vs the national average.",
  questions: "Number of questions the MP raised in the House this term (PRS), vs the national average.",
  pmb: "Private Member's Bills the MP introduced, bills proposed by an MP who isn't a minister.",
  activityIndex:
    "A mechanical 0-100 composite of attendance, debates and questions relative to national averages. A summary of activity, NOT a rating of merit or impact.",

  // Poll
  satisfaction:
    "An unscientific, self-selected public poll (one vote per device). The score is the share that voted 'satisfied', a measure of opinion here, not a representative survey.",

  // Budget / tax
  rupeeComesFrom:
    "How the Union government funds its budget, the share of each rupee from income tax, GST, corporation tax, borrowings, etc. (Budget at a Glance, Ministry of Finance).",
  rupeeGoesTo:
    "How the Union government spends each rupee, the share going to states, interest, schemes, defence, subsidies, etc. (Budget at a Glance).",
  incomeTax: "Direct tax individuals pay on their income.",
  gst: "Goods and Services Tax, an indirect tax on most goods and services.",
  corporationTax: "Tax companies pay on their profits.",
  taxEstimate:
    "A rough estimate under the FY2025-26 new regime (after standard deduction and the section 87A rebate, plus 4% cess). Not tax advice, real liability depends on your regime, deductions and other income.",
  effectiveRate: "Your estimated total tax as a percentage of your gross income.",

  // Coverage
  coverage:
    "We only list people with a verifiable public record. Counts like '485 of 543' mean the rest have no published affidavit, we don't guess them. See the Coverage page.",
};

export type DefKey = keyof typeof DEFS;

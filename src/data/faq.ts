// FAQ content, surfaced on /about and emitted as FAQPage structured data for
// search + AI answer engines. Plain, factual, non-partisan.

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "What is PaisaWatch?",
    a: "PaisaWatch is a free, non-partisan tool that shows how India's public money is spent and what elected representatives have declared. It maps MPLADS public-works spending by state and sector, and the affidavit and performance records of Members of Parliament and MLAs — with every figure linked to its official source.",
  },
  {
    q: "Where does PaisaWatch get its data?",
    a: "MPLADS spending comes from data.gov.in (Ministry of Statistics & Programme Implementation). MPs' and MLAs' declared assets, liabilities and pending criminal cases come from their election affidavits, compiled by ADR/MyNeta. MP performance (attendance, debates, questions) comes from PRS Legislative Research, and Union Budget figures from the Ministry of Finance. Each record links back to its source.",
  },
  {
    q: "Is the data accurate and real?",
    a: "Every figure comes from an official public record and links back to it. Affidavit data is self-declared by candidates, so we present it as declared, not independently audited. Where a record has not been published, we say so rather than guess — nothing is invented.",
  },
  {
    q: "What does 'pending criminal cases' mean on a profile?",
    a: "These are cases the person themselves declared as pending in their election affidavit — charges that have not been decided by a court. They are NOT convictions, and showing them is not an allegation of guilt. Click the figure to see the actual declared cases at the source.",
  },
  {
    q: "Why doesn't PaisaWatch cover all 543 MPs or all 4,120 MLAs?",
    a: "We only list people who have a verifiable public affidavit. ADR has analysed 485 of the 543 Lok Sabha MPs and most sitting MLAs; the remainder have no published affidavit, so we do not fabricate their numbers. The Coverage page explains exactly what is and isn't included, and why.",
  },
  {
    q: "How do I look up my MP or MLA?",
    a: "Open the MPs or MLAs page and search by the person's name, their constituency, or their state. Each profile shows declared assets, liabilities, pending cases, education, and — for MPs — parliamentary attendance and activity.",
  },
  {
    q: "How can I see where my taxes go?",
    a: "The dashboard shows the Union Budget breakdown — where each rupee of national revenue comes from and where it goes. The calculators let you estimate your own income tax and see how that amount maps onto national spending.",
  },
  {
    q: "Is PaisaWatch free, and is it affiliated with any party or the government?",
    a: "It is completely free, with no login and no ads. It is independent and non-partisan — it only aggregates official public data and never editorialises or takes sides.",
  },
  {
    q: "Who built PaisaWatch?",
    a: "PaisaWatch is an independent civic project built by Vinod Ashok Chinnannavar to make India's public data easier for any citizen to read.",
  },
];

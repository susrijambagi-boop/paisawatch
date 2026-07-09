import type { Expenditure, ExpenditureWithMp, Mp } from "@/lib/types";
import { scoreRisk } from "@/lib/risk";

// ---------------------------------------------------------------------------
// FALLBACK DATA, only used if the live data.gov.in fetch fails. Figures here
// are illustrative placeholders, not official records. The app shows a clear
// "sample data" banner whenever this is in use.
// ---------------------------------------------------------------------------

export const DEMO_MPS: Mp[] = [
  { id: "sample-a", slug: "sample-a", name: "Sample State A", party: "MPLADS", house: "State / UT", constituency: "", state: "Sample State A", photoUrl: null, lat: 22.9734, lng: 78.6569, bio: "Sample fallback record, live data unavailable." },
  { id: "sample-b", slug: "sample-b", name: "Sample State B", party: "MPLADS", house: "State / UT", constituency: "", state: "Sample State B", photoUrl: null, lat: 19.7515, lng: 75.7139, bio: "Sample fallback record, live data unavailable." },
];

type RawExpenditure = Omit<Expenditure, "id" | "risk">;

const RAW: RawExpenditure[] = [
  { mpId: "sample-a", category: "roads", amount: 340_000_000, vendor: "sample", note: "Sample roads spending (placeholder).", location: "Sample State A", state: "Sample State A", lat: 22.9734, lng: 78.6569, occurredAt: "2020-03-31T00:00:00.000Z", sourceUrl: null },
  { mpId: "sample-a", category: "education", amount: 72_000_000, vendor: "sample", note: "Sample education spending (placeholder).", location: "Sample State A", state: "Sample State A", lat: 22.9734, lng: 78.6569, occurredAt: "2020-03-31T00:00:00.000Z", sourceUrl: null },
  { mpId: "sample-b", category: "water", amount: 120_000_000, vendor: "sample", note: "Sample drinking-water spending (placeholder).", location: "Sample State B", state: "Sample State B", lat: 19.7515, lng: 75.7139, occurredAt: "2020-03-31T00:00:00.000Z", sourceUrl: null },
];

export function demoExpenditures(): ExpenditureWithMp[] {
  const byId = new Map(DEMO_MPS.map((mp) => [mp.id, mp]));
  return RAW.map((raw, index) => ({
    ...raw,
    id: `sample_${index}`,
    risk: scoreRisk({ amount: raw.amount }),
    mp: byId.get(raw.mpId)!,
  })).sort((a, b) => b.amount - a.amount);
}

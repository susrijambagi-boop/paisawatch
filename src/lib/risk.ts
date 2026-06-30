import { LARGE_SPEND_THRESHOLD } from "./constants";
import type { CategoryKey } from "./types";

// "Spend size" — a simple, honest magnitude score for an amount. This data is
// aggregate development spending, so there is nothing inherently suspicious
// about a large figure; the score just helps surface the biggest line items.
// Kept as a pure function for easy testing.

const FULL_BAR_AMOUNT = 500_000_000; // ₹50 crore maps to a full (100) bar
const MEDIUM_THRESHOLD = 50_000_000; // ₹5 crore

export interface RiskInput {
  category?: CategoryKey;
  amount: number;
  note?: string;
}

export function scoreRisk({ amount }: RiskInput): number {
  return Math.min(100, Math.round((amount / FULL_BAR_AMOUNT) * 100));
}

export type RiskTier = "routine" | "review" | "high";

export function spendTier(amount: number): RiskTier {
  if (amount >= LARGE_SPEND_THRESHOLD) return "high";
  if (amount >= MEDIUM_THRESHOLD) return "review";
  return "routine";
}

// Backwards-compatible name used by the UI; tiers are derived from the amount
// implied by the score so callers can pass either.
export function riskTier(score: number): RiskTier {
  const amount = (score / 100) * FULL_BAR_AMOUNT;
  return spendTier(amount);
}

export const RISK_TIER_LABEL: Record<RiskTier, string> = {
  routine: "Small",
  review: "Medium",
  high: "Large",
};

import { riskTier, type RiskTier } from "./risk";

// Tailwind class sets per risk tier, shared across cards, badges and the map.
export const RISK_STYLES: Record<
  RiskTier,
  { text: string; bg: string; bar: string; dot: string; hex: string }
> = {
  routine: {
    text: "text-emerald-700",
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    hex: "#10b981",
  },
  review: {
    text: "text-amber-700",
    bg: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    hex: "#f59e0b",
  },
  high: {
    text: "text-blue-700",
    bg: "bg-blue-50 text-blue-700 ring-blue-200",
    bar: "bg-blue-600",
    dot: "bg-blue-600",
    hex: "#2563eb",
  },
};

export function riskStyle(score: number) {
  return RISK_STYLES[riskTier(score)];
}

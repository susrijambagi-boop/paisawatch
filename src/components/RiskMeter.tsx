import { riskTier, RISK_TIER_LABEL } from "@/lib/risk";
import { riskStyle } from "@/lib/ui";

export function RiskMeter({ score }: { score: number }) {
  const style = riskStyle(score);
  const label = RISK_TIER_LABEL[riskTier(score)];
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${style.text}`}>
        {score} · {label}
      </span>
    </div>
  );
}

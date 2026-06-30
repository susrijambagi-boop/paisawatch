import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { formatINR, timeAgo } from "@/lib/format";
import { riskStyle } from "@/lib/ui";
import type { ExpenditureWithMp } from "@/lib/types";
import { Icon } from "./Icon";
import { MpAvatar } from "./MpAvatar";
import { RiskMeter } from "./RiskMeter";
import { ShareButton } from "./ShareButton";

export function ExpenditureCard({ item }: { item: ExpenditureWithMp }) {
  const category = CATEGORIES[item.category];
  const style = riskStyle(item.risk);
  const shareText = `${item.mp.name}: ${formatINR(item.amount)} of MPLADS spending on ${category.label}. Source: data.gov.in. Via PaisaWatch.`;

  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <Link href={`/mp/${item.mp.slug}`}>
          <MpAvatar mp={item.mp} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/mp/${item.mp.slug}`}
            className="font-semibold text-slate-900 hover:underline"
          >
            {item.mp.name}
          </Link>
          <div className="text-xs text-slate-500">
            {item.mp.party}
            {item.mp.constituency ? ` · ${item.mp.constituency}` : ""} ·{" "}
            {timeAgo(item.occurredAt)}
          </div>
        </div>
        <div className={`text-right text-xl font-semibold ${style.text}`}>
          {formatINR(item.amount)}
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <Icon name={category.icon} className="text-slate-400" />
        {item.note}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          {category.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          {item.vendor}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          <Icon name="map-pin" /> {item.location}
        </span>
      </div>

      <div className="mt-3">
        <RiskMeter score={item.risk} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <Icon name="external-link" /> Source record
          </a>
        ) : (
          <span className="text-xs text-slate-400">No source linked</span>
        )}
        <ShareButton url={`/mp/${item.mp.slug}`} text={shareText} />
      </div>
    </article>
  );
}

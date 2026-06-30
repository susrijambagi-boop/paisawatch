"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { timeAgo } from "@/lib/format";
import type { NewsItem } from "@/app/api/news/route";

// Latest news about a representative — aggregated headlines that link out to the
// source. We don't reproduce articles, and we don't classify them as good/bad;
// readers judge for themselves.
export function LatestNews({ name, context }: { name: string; context?: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const query = context ? `"${name}" ${context}` : `"${name}"`;
    fetch(`/api/news?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => active && setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [name, context]);

  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
        <Icon name="news" /> Latest news
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        Recent headlines from across the web, matched by name (may include others with the same
        name). Aggregated, not verified or endorsed — click through to read at the source.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading headlines…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
          No recent news found.
        </p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={i}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 hover:ring-slate-300"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {item.source}
                    {item.date ? ` · ${timeAgo(item.date)}` : ""}
                  </span>
                </span>
                <Icon name="external-link" className="mt-1 shrink-0 text-slate-400" />
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

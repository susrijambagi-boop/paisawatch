import { NextResponse } from "next/server";

// Per-person latest-news feed. Aggregates recent headlines from Google News
// (title, source, date, link) and links out — it does NOT reproduce article
// text, classify, or judge. Cached server-side so we don't refetch per view.

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  date: string;
}

const cache = new Map<string, { at: number; items: NewsItem[] }>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const block of xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []) {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? decode(m[1]) : "";
    };
    const source = get("source");
    let title = get("title");
    // Google News appends " - Source" to titles; drop it when redundant.
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const pub = get("pubDate");
    items.push({
      title,
      url: get("link"),
      source,
      date: pub ? new Date(pub).toISOString() : "",
    });
  }
  return items;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json({ items: cached.items });
  }

  try {
    // Caller supplies the full query (it quotes the name and may append a
    // constituency to disambiguate same-name people); we pass it through as-is.
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`news ${res.status}`);
    const items = parseRss(await res.text()).slice(0, 10);
    cache.set(key, { at: Date.now(), items });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://paisawatch.live";

// Open to search engines AND to AI/answer-engine crawlers (we want PaisaWatch's
// public data to surface in AI answers). Explicit allows for the major bots.
export default function robots(): MetadataRoute.Robots {
  const aiAndSearchBots = [
    "Googlebot",
    "Bingbot",
    "DuckDuckBot",
    "GPTBot", // OpenAI
    "OAI-SearchBot", // OpenAI search
    "ChatGPT-User",
    "ClaudeBot", // Anthropic
    "Claude-Web",
    "anthropic-ai",
    "Google-Extended", // Gemini / Bard training
    "PerplexityBot",
    "Applebot",
    "Applebot-Extended",
    "Amazonbot",
    "CCBot", // Common Crawl (feeds many LLMs)
    "cohere-ai",
    "Meta-ExternalAgent",
    "Bytespider",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...aiAndSearchBots.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

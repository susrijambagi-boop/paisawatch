import type { MetadataRoute } from "next";
import { getReps } from "@/lib/reps";
import { getMlas } from "@/lib/mlas";
import { getMps } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://paisawatch.live";

// Regenerated on every build/deploy, so new MPs, MLAs and pages are always
// included automatically.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = ["", "/feed", "/map", "/tools", "/reps", "/mlas", "/officials", "/transparency", "/about"];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.7,
  }));

  const repEntries: MetadataRoute.Sitemap = getReps().map((r) => ({
    url: `${BASE}/rep/${r.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const mlaEntries: MetadataRoute.Sitemap = getMlas().map((m) => ({
    url: `${BASE}/mla/${m.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  let stateEntries: MetadataRoute.Sitemap = [];
  try {
    const { items } = await getMps();
    stateEntries = items.map((s) => ({
      url: `${BASE}/mp/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    /* state pages omitted if the source is unavailable */
  }

  return [...staticEntries, ...stateEntries, ...repEntries, ...mlaEntries];
}

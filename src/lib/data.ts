import type {
  ExpenditureFilters,
  ExpenditureWithMp,
  Mp,
} from "./types";
import { demoExpenditures, DEMO_MPS } from "@/data/demo";
import { getAnonClient, getServiceClient, isSupabaseConfigured } from "./supabase";
import { scoreRisk } from "./risk";
import { fetchMpladsRecords } from "./sources/mplads";

export type DataSource = "supabase" | "datagovin" | "demo";

// Repository over public-spending data. Reads prefer Supabase and fall back to
// the fictional demo set so the UI is never empty. `isDemo` lets the UI show a
// clear banner. Storage details live here; pages and components never touch
// Supabase directly.

export interface FeedResult {
  items: ExpenditureWithMp[];
  isDemo: boolean;
  source: DataSource;
}

// In-memory cache for the live data.gov.in feed so we don't refetch on every
// request. The underlying fetch also uses Next's 6h revalidation.
const LIVE_TTL_MS = 6 * 60 * 60 * 1000;
let liveCache: { at: number; data: ExpenditureWithMp[] } | null = null;

async function getLiveData(): Promise<ExpenditureWithMp[]> {
  if (liveCache && Date.now() - liveCache.at < LIVE_TTL_MS) {
    return liveCache.data;
  }
  const data = await fetchMpladsRecords();
  liveCache = { at: Date.now(), data };
  return data;
}

export interface Stats {
  total: number;
  count: number;
  highRisk: number;
  mpCount: number;
}

function applyFilters(
  items: ExpenditureWithMp[],
  filters: ExpenditureFilters,
): ExpenditureWithMp[] {
  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.state && item.state !== filters.state) return false;
    if (filters.mpId && item.mpId !== filters.mpId) return false;
    if (filters.minRisk != null && item.risk < filters.minRisk) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${item.mp.name} ${item.vendor} ${item.note} ${item.location}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Maps a Supabase row (snake_case) into a domain Expenditure (camelCase).
function rowToExpenditure(row: Record<string, unknown>): ExpenditureWithMp {
  const mpRow = (row.mp ?? {}) as Record<string, unknown>;
  const mp: Mp = {
    id: String(mpRow.id ?? row.mp_id),
    slug: String(mpRow.slug ?? ""),
    name: String(mpRow.name ?? "Unknown"),
    party: String(mpRow.party ?? ""),
    house: (mpRow.house as Mp["house"]) ?? "Lok Sabha",
    constituency: String(mpRow.constituency ?? ""),
    state: String(mpRow.state ?? ""),
    photoUrl: (mpRow.photo_url as string | null) ?? null,
    lat: (mpRow.lat as number | null) ?? null,
    lng: (mpRow.lng as number | null) ?? null,
    bio: (mpRow.bio as string | null) ?? null,
  };
  const amount = Number(row.amount);
  const category = row.category as ExpenditureWithMp["category"];
  const note = String(row.note ?? "");
  return {
    id: String(row.id),
    mpId: String(row.mp_id),
    category,
    amount,
    vendor: String(row.vendor ?? ""),
    note,
    location: String(row.location ?? ""),
    state: String(row.state ?? ""),
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
    occurredAt: String(row.occurred_at),
    sourceUrl: (row.source_url as string | null) ?? null,
    risk: scoreRisk({ category, amount, note }),
    mp,
  };
}

export async function getFeed(
  filters: ExpenditureFilters = {},
  limit = 500,
): Promise<FeedResult> {
  // 1. Supabase, if configured (e.g. once an ingestion pipeline writes there).
  const client = getAnonClient();
  if (isSupabaseConfigured() && client) {
    let query = client
      .from("expenditures")
      .select("*, mp:mps(*)")
      .order("occurred_at", { ascending: false })
      .limit(limit);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.state) query = query.eq("state", filters.state);
    if (filters.mpId) query = query.eq("mp_id", filters.mpId);

    const { data, error } = await query;
    if (!error && data) {
      const items = applyFilters(data.map(rowToExpenditure), {
        minRisk: filters.minRisk,
        search: filters.search,
      });
      return { items, isDemo: false, source: "supabase" };
    }
  }

  // 2. Live official data from data.gov.in.
  try {
    const all = await getLiveData();
    return {
      items: applyFilters(all, filters).slice(0, limit),
      isDemo: false,
      source: "datagovin",
    };
  } catch {
    // 3. Fictional fallback so the UI is never empty.
    return {
      items: applyFilters(demoExpenditures(), filters),
      isDemo: true,
      source: "demo",
    };
  }
}

export async function getMps(): Promise<{ items: Mp[]; isDemo: boolean }> {
  const client = getAnonClient();
  if (isSupabaseConfigured() && client) {
    const { data, error } = await client.from("mps").select("*").order("name");
    if (!error && data) {
      const items = data.map(
        (row) =>
          rowToExpenditure({
            mp: row,
            mp_id: row.id,
            amount: 0,
            category: "others",
            occurred_at: new Date().toISOString(),
          }).mp,
      );
      return { items, isDemo: false };
    }
  }

  try {
    const all = await getLiveData();
    const byId = new Map<string, Mp>();
    for (const item of all) byId.set(item.mp.id, item.mp);
    return { items: [...byId.values()], isDemo: false };
  } catch {
    return { items: DEMO_MPS, isDemo: true };
  }
}

export async function getMpBySlug(
  slug: string,
): Promise<{ mp: Mp | null; expenditures: ExpenditureWithMp[]; isDemo: boolean }> {
  const feed = await getFeed({}, 500);
  const mp =
    feed.items.find((item) => item.mp.slug === slug)?.mp ??
    DEMO_MPS.find((m) => m.slug === slug) ??
    null;
  const expenditures = mp
    ? feed.items.filter((item) => item.mpId === mp.id)
    : [];
  return { mp, expenditures, isDemo: feed.isDemo };
}

export function computeStats(items: ExpenditureWithMp[]): Stats {
  const mpIds = new Set(items.map((i) => i.mpId));
  return {
    total: items.reduce((sum, i) => sum + i.amount, 0),
    count: items.length,
    highRisk: items.filter((i) => i.risk >= 40).length,
    mpCount: mpIds.size,
  };
}

// --- Writes -----------------------------------------------------------------

export interface EmailSubscriptionInput {
  email: string;
  scope: "all" | "mp" | "state";
  scopeValue: string | null;
}

export async function createEmailSubscription(
  input: EmailSubscriptionInput,
): Promise<{ ok: boolean; demo: boolean; error?: string }> {
  const client = getServiceClient();
  if (!client) return { ok: true, demo: true };
  const { error } = await client.from("subscriptions").insert({
    email: input.email,
    scope: input.scope,
    scope_value: input.scopeValue,
  });
  if (error) return { ok: false, demo: false, error: error.message };
  return { ok: true, demo: false };
}

export async function savePushSubscription(
  subscription: unknown,
  scope: string,
  scopeValue: string | null,
): Promise<{ ok: boolean; demo: boolean; error?: string }> {
  const client = getServiceClient();
  if (!client) return { ok: true, demo: true };
  const { error } = await client.from("push_subscriptions").insert({
    subscription,
    scope,
    scope_value: scopeValue,
  });
  if (error) return { ok: false, demo: false, error: error.message };
  return { ok: true, demo: false };
}

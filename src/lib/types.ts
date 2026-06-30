// Domain types for the public-spending transparency app.
// These mirror the Supabase schema in supabase/schema.sql.

// MPLADS development sectors (from data.gov.in / MoSPI).
export type CategoryKey =
  | "roads"
  | "education"
  | "water"
  | "sanitation"
  | "public_facilities"
  | "others";

export type House = "Lok Sabha" | "Rajya Sabha" | "State Assembly" | "Local Body" | "State / UT";

export interface Mp {
  id: string;
  slug: string;
  name: string;
  party: string;
  house: House;
  constituency: string;
  state: string;
  photoUrl: string | null;
  // Approximate constituency centroid, used only to place a map marker.
  lat: number | null;
  lng: number | null;
  bio: string | null;
}

export interface Expenditure {
  id: string;
  mpId: string;
  category: CategoryKey;
  amount: number; // in INR (rupees)
  vendor: string;
  note: string;
  // Where the spend happened (district/place) — drives the map.
  location: string;
  state: string;
  lat: number | null;
  lng: number | null;
  occurredAt: string; // ISO date
  sourceUrl: string | null; // link to the original record once ingested
  risk: number; // 0..100, computed
}

export interface ExpenditureWithMp extends Expenditure {
  mp: Mp;
}

export interface ExpenditureFilters {
  category?: CategoryKey;
  state?: string;
  mpId?: string;
  minRisk?: number;
  search?: string;
}

export type SubscriptionScope =
  | { kind: "all" }
  | { kind: "mp"; mpId: string }
  | { kind: "state"; state: string };

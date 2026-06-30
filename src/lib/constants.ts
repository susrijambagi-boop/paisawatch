import type { CategoryKey } from "./types";

// Alerts fire to subscribers when a watched state's spend crosses this.
export const HIGH_SPEND_THRESHOLD = 50_000_000; // ₹5 crore
// Spend at/above this rupee amount counts as a "large" item.
export const LARGE_SPEND_THRESHOLD = 200_000_000; // ₹20 crore

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  icon: string; // tabler icon name (rendered via the ti webfont)
}

// The MPLADS development sectors reported by data.gov.in / MoSPI.
export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  roads: { key: "roads", label: "Roads, rail & bridges", icon: "road" },
  education: { key: "education", label: "Education", icon: "school" },
  water: { key: "water", label: "Drinking water", icon: "droplet" },
  sanitation: { key: "sanitation", label: "Sanitation & health", icon: "heart-plus" },
  public_facilities: { key: "public_facilities", label: "Public facilities", icon: "building-community" },
  others: { key: "others", label: "Others", icon: "dots" },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const DATA_SOURCES = {
  // data.gov.in resources (Ministry of Statistics & Programme Implementation).
  worksResource: "2a647529-e419-4ce4-bc6e-77641f0ba9af",
  sectorsResource: "e4f1457e-0ba7-4f39-98e3-7fb747f19733",
  catalogUrl: "https://www.data.gov.in/catalog/members-parliament-local-area-development-scheme-mplads",
};

export const SITE = {
  name: "PaisaWatch",
  tagline: "India's public money, on the map",
  description:
    "Track MPLADS public-works spending across India by state and sector, using official data.gov.in records. Follow a state, get alerted on new data, and share the numbers.",
};

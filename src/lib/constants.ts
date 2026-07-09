import type { CategoryKey } from "./types";

// Alerts fire to subscribers when a watched state's spend crosses this.
export const HIGH_SPEND_THRESHOLD = 50_000_000; // ₹5 crore
// Spend at/above this rupee amount counts as a "large" item.
export const LARGE_SPEND_THRESHOLD = 200_000_000; // ₹20 crore

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  icon: string; // tabler icon name (rendered via the ti webfont)
  def: string; // plain-language definition for the InfoTip
}

// The MPLADS development sectors reported by data.gov.in / MoSPI.
export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  roads: { key: "roads", label: "Roads, rail & bridges", icon: "road", def: "MPLADS works on roads, railway facilities, pathways and bridges." },
  education: { key: "education", label: "Education", icon: "school", def: "MPLADS works on schools, classrooms and other educational facilities." },
  water: { key: "water", label: "Drinking water", icon: "droplet", def: "MPLADS works that provide drinking-water facilities." },
  sanitation: { key: "sanitation", label: "Sanitation & health", icon: "heart-plus", def: "MPLADS works on sanitation, toilets and public health." },
  public_facilities: { key: "public_facilities", label: "Public facilities", icon: "building-community", def: "Other public facilities — community halls, street lighting, parks and the like." },
  others: { key: "others", label: "Others", icon: "dots", def: "MPLADS works not covered by the named sectors." },
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
  tagline: "Track India's public money, taxes and your MP",
  description:
    "See where India's tax money goes, what your MP or MLA declared, and whether your salary beats inflation. Free, source-linked and non-partisan, built on official public data.",
};

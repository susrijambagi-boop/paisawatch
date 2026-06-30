// Approximate centroids for Indian states/UTs, used to place each state's
// spending on the map and to normalise the differing names used across
// data.gov.in datasets (e.g. "A & N Islands" vs "Andaman & Nicobar Islands",
// "Andhra Pradesh (Old)" vs "Andhra Pradesh").

export interface StateInfo {
  name: string;
  slug: string;
  lat: number;
  lng: number;
}

const STATES: StateInfo[] = [
  { name: "Andhra Pradesh", slug: "andhra-pradesh", lat: 15.9129, lng: 79.74 },
  { name: "Arunachal Pradesh", slug: "arunachal-pradesh", lat: 28.218, lng: 94.7278 },
  { name: "Assam", slug: "assam", lat: 26.2006, lng: 92.9376 },
  { name: "Bihar", slug: "bihar", lat: 25.0961, lng: 85.3131 },
  { name: "Chhattisgarh", slug: "chhattisgarh", lat: 21.2787, lng: 81.8661 },
  { name: "Goa", slug: "goa", lat: 15.2993, lng: 74.124 },
  { name: "Gujarat", slug: "gujarat", lat: 22.2587, lng: 71.1924 },
  { name: "Haryana", slug: "haryana", lat: 29.0588, lng: 76.0856 },
  { name: "Himachal Pradesh", slug: "himachal-pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Jammu and Kashmir", slug: "jammu-and-kashmir", lat: 33.7782, lng: 76.5762 },
  { name: "Jharkhand", slug: "jharkhand", lat: 23.6102, lng: 85.2799 },
  { name: "Karnataka", slug: "karnataka", lat: 15.3173, lng: 75.7139 },
  { name: "Kerala", slug: "kerala", lat: 10.8505, lng: 76.2711 },
  { name: "Madhya Pradesh", slug: "madhya-pradesh", lat: 22.9734, lng: 78.6569 },
  { name: "Maharashtra", slug: "maharashtra", lat: 19.7515, lng: 75.7139 },
  { name: "Manipur", slug: "manipur", lat: 24.6637, lng: 93.9063 },
  { name: "Meghalaya", slug: "meghalaya", lat: 25.467, lng: 91.3662 },
  { name: "Mizoram", slug: "mizoram", lat: 23.1645, lng: 92.9376 },
  { name: "Nagaland", slug: "nagaland", lat: 26.1584, lng: 94.5624 },
  { name: "Odisha", slug: "odisha", lat: 20.9517, lng: 85.0985 },
  { name: "Punjab", slug: "punjab", lat: 31.1471, lng: 75.3412 },
  { name: "Rajasthan", slug: "rajasthan", lat: 27.0238, lng: 74.2179 },
  { name: "Sikkim", slug: "sikkim", lat: 27.533, lng: 88.5122 },
  { name: "Tamil Nadu", slug: "tamil-nadu", lat: 11.1271, lng: 78.6569 },
  { name: "Telangana", slug: "telangana", lat: 18.1124, lng: 79.0193 },
  { name: "Tripura", slug: "tripura", lat: 23.9408, lng: 91.9882 },
  { name: "Uttar Pradesh", slug: "uttar-pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Uttarakhand", slug: "uttarakhand", lat: 30.0668, lng: 79.0193 },
  { name: "West Bengal", slug: "west-bengal", lat: 22.9868, lng: 87.855 },
  { name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar-islands", lat: 11.7401, lng: 92.6586 },
  { name: "Chandigarh", slug: "chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Dadra and Nagar Haveli", slug: "dadra-and-nagar-haveli", lat: 20.1809, lng: 73.0169 },
  { name: "Daman and Diu", slug: "daman-and-diu", lat: 20.4283, lng: 72.8397 },
  { name: "Delhi", slug: "delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Lakshadweep", slug: "lakshadweep", lat: 10.5667, lng: 72.6417 },
  { name: "Puducherry", slug: "puducherry", lat: 11.9416, lng: 79.8083 },
];

function normalise(raw: string): string {
  return raw
    .replace(/\(old\)/gi, "")
    .replace(/&/g, "and")
    .replace(/[^a-z]/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const BY_NORMALISED = new Map<string, StateInfo>();
for (const s of STATES) {
  BY_NORMALISED.set(normalise(s.name), s);
}
// A few extra aliases that don't normalise cleanly to the canonical name.
const ALIASES: Record<string, string> = {
  "a n islands": "andaman and nicobar islands",
  "a and n island": "andaman and nicobar islands",
  "a and n islands": "andaman and nicobar islands",
  "orissa": "odisha",
  "pondicherry": "puducherry",
  "nct of delhi": "delhi",
};

export function lookupState(raw: string): StateInfo | null {
  const key = normalise(raw);
  if (BY_NORMALISED.has(key)) return BY_NORMALISED.get(key)!;
  const alias = ALIASES[key];
  if (alias && BY_NORMALISED.has(alias)) return BY_NORMALISED.get(alias)!;
  return null;
}

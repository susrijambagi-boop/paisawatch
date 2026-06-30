// Indian-context formatting helpers. All money is INR with lakh/crore grouping.

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return INR.format(Math.round(amount));
}

const ONE_LAKH = 100_000;
const ONE_CRORE = 10_000_000;

// Compact rupee display for stat tiles and headlines, e.g. ₹4.8 Cr, ₹23 L.
export function formatCompactINR(amount: number): string {
  const n = Math.round(amount);
  if (n >= ONE_CRORE) return `₹${trim(n / ONE_CRORE)} Cr`;
  if (n >= ONE_LAKH) return `₹${trim(n / ONE_LAKH)} L`;
  return INR.format(n);
}

function trim(value: number): string {
  // One decimal, but drop a trailing ".0".
  return value.toFixed(1).replace(/\.0$/, "");
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function initials(name: string): string {
  // Strip honorifics, then take first letters of the first two real names.
  const cleaned = name.replace(/^(Shri|Smt\.?|Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, "");
  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

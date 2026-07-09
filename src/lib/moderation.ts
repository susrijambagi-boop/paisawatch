// Lightweight moderation for public comments. This is a first line of defence,
// not a complete system, a public deployment should add a durable rate-limit
// store (e.g. Upstash) and a human review/report queue. See DEPLOY.md.

// Obvious slurs/spam markers. Kept deliberately small and conservative; the
// goal is to block the worst, not to police opinion.
const BANNED = [
  "fuck", "bitch", "bastard", "chutiya", "madarchod", "behenchod", "randi",
  "viagra", "casino", "loan offer", "click here to win",
];

const URL_RE = /https?:\/\//gi;

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export function moderateContent(body: string): ModerationResult {
  const lower = body.toLowerCase();
  if (BANNED.some((w) => lower.includes(w))) {
    return { ok: false, reason: "Comment contains language that isn't allowed." };
  }
  const urls = body.match(URL_RE);
  if (urls && urls.length > 2) {
    return { ok: false, reason: "Too many links, looks like spam." };
  }
  if (/(.)\1{15,}/.test(body)) {
    return { ok: false, reason: "Comment looks like spam." };
  }
  return { ok: true };
}

// In-memory sliding-window rate limit, keyed by IP. Resets on cold start, so
// production should swap this for a shared store.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimit(key: string): ModerationResult {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return { ok: false, reason: "You're posting too fast. Try again in a few minutes." };
  }
  recent.push(now);
  hits.set(key, recent);
  return { ok: true };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

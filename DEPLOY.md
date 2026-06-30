# Deploying PaisaWatch

The app runs publicly on real data with zero config (data.gov.in MPLADS +
vendored MyNeta/PRS MP data). To make it fully production-ready you mainly need
a database for comments and subscribers.

## 1. Vercel (recommended)

1. Push this repo to GitHub.
2. Import it at vercel.com → New Project.
3. Add the env vars from `.env.example` (see below).
4. Deploy. The map, feed, states and MP pages work immediately.

## 2. Environment variables

| Var | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Comments + subscribers persistence | Run `supabase/schema.sql` first |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Browser push alerts | `npm run vapid` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Email alerts | resend.com |
| `DATA_GOV_IN_API_KEY` | Higher data.gov.in rate limits | Optional; falls back to public sample key |
| `NEXT_PUBLIC_SITE_URL` | Share links + OG cards | e.g. https://paisawatch.in |

Without Supabase, comments fall back to a non-durable in-memory store (fine for
preview, not for production).

## 3. Data refresh

- **MPLADS (states):** fetched live and cached 6h — no action needed.
- **MP affidavit + performance data:** vendored in `src/data/mps-affidavits.json`.
  Refresh by running `npx tsx scripts/scrape-myneta.ts` and committing, or wire
  it to a scheduled GitHub Action.

## 4. Moderation (do before going public)

Comments have a first line of defence (`src/lib/moderation.ts`): a content
filter and an in-memory rate limit. Before a real public launch:

- Move the rate limit to a durable store (e.g. Upstash Redis) — the in-memory
  one resets on each serverless cold start.
- Add a report/▿hide queue and human review (the `comments` table can carry a
  `hidden` boolean).
- Consider requiring a lightweight check (hCaptcha/Turnstile) on the form.

## 5. Pre-launch checklist

- [ ] `npm run build` passes
- [ ] Supabase schema applied; comments + subscribe persist
- [ ] VAPID + Resend keys set; a test alert delivered
- [ ] `NEXT_PUBLIC_SITE_URL` set; OG share card renders
- [ ] Moderation hardened (durable rate limit + review queue)
- [ ] MP dataset refreshed and dated on the page

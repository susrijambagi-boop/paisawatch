# PaisaWatch — India public-spending transparency

Follow how MPs, MLAs and ministers spend public money. Follow an official, get
alerted (email + browser push) when they spend, filter the feed, see the spend
map, and share the receipts.

> **Status: deployable v1 with live data.** Out of the box it shows **real
> MPLADS public-works spending** pulled from data.gov.in (no config needed). It
> falls back to clearly-labelled sample data only if that source is unreachable.
> Optionally add Supabase to persist subscribers and serve from your own DB.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000  (demo data, no config needed)
```

## Tech

- **Next.js 16** (App Router) + **React 19** + **Tailwind v4**
- **Live data:** MPLADS datasets from data.gov.in (MoSPI) — see `src/lib/sources/mplads.ts`
- **Supabase** (Postgres) for subscribers + optional self-hosted records
- **web-push** (browser alerts) + **Resend** (email)
- **d3-geo / topojson** for the India map (states merged + projected server-side)

## Live data

The feed, map and state pages use two official MPLADS datasets from
[data.gov.in](https://www.data.gov.in) (Ministry of Statistics & Programme
Implementation):

1. State-wise expenditure (₹ crore) + completed works, FY2016-17 to FY2019-20.
2. Sector-wise split (roads, education, drinking water, sanitation & health,
   public facilities, others).

Each state's **total** is the official figure; the **per-sector** amount applies
that state's reported sector mix to the total (disclosed in-app). Data resolves
in this order: Supabase (if configured) → data.gov.in → sample fallback.

It works with data.gov.in's public sample key by default. For higher rate
limits, set `DATA_GOV_IN_API_KEY` (free from data.gov.in). Responses are cached
6 hours.

## Project layout

```
src/
  lib/         types, INR formatting, risk model, supabase client, data repo, map geo
  data/        demo.ts (fictional sample) + india-districts-topo.json
  components/   feed card, filters, subscribe form, share, map, etc.
  app/         / (feed) · /map · /officials · /mp/[slug] · /about · /api/*
supabase/      schema.sql (tables + RLS)
scripts/       seed.ts (load officials) · ingest-mplads.ts (pipeline skeleton)
```

## Going live

1. **Create a Supabase project**, run `supabase/schema.sql` in the SQL editor.
2. **Copy `.env.example` to `.env.local`** and fill in:
   - Supabase URL + anon + service-role keys
   - VAPID keys — generate with `npm run vapid`
   - Resend API key + `EMAIL_FROM`
   - `NEXT_PUBLIC_SITE_URL`
3. **Seed officials:** `npm run seed` (loads the demo officials; replace with a
   real roster — names/constituencies/photos are public record).
4. **Connect real spending data:** implement `fetchAndNormalize()` in
   `scripts/ingest-mplads.ts` against your chosen source (MPLADS works export,
   PFMS, or a data.gov.in resource), then schedule `npm run ingest`
   (Vercel Cron or a GitHub Action). Every record must carry a `source_url`.

## Deploy (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Add the same env vars in the Vercel project settings.
3. Deploy. Add a Cron Job hitting your ingestion route/script on a schedule.

## Important: data integrity & safety

- **No live location tracking.** The map plots constituencies and where money
  was *spent* — never a person's real-time whereabouts.
- **Demo officials are fictional.** Never publish unverified spending figures
  against a real, named person. Real spend enters only via the ingestion
  pipeline, each row linked to its official source.
- The **scrutiny score is an explainable heuristic** (category + amount +
  red-flag phrases), not an allegation of wrongdoing. It only ranks what is
  worth a closer look. See `/about` and `src/lib/risk.ts`.

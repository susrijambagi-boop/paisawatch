-- PaisaWatch schema. Run this in the Supabase SQL editor (or `supabase db push`).
-- Public read access; writes only via the service role (server-side).

create extension if not exists "pgcrypto";

-- Elected / public officials -------------------------------------------------
create table if not exists mps (
  id           text primary key,
  slug         text unique not null,
  name         text not null,
  party        text not null default '',
  house        text not null default 'Lok Sabha',
  constituency text not null default '',
  state        text not null default '',
  photo_url    text,
  lat          double precision,
  lng          double precision,
  bio          text,
  created_at   timestamptz not null default now()
);

-- Spending records -----------------------------------------------------------
create table if not exists expenditures (
  id          uuid primary key default gen_random_uuid(),
  mp_id       text not null references mps(id) on delete cascade,
  category    text not null,
  amount      numeric not null check (amount >= 0),
  vendor      text not null default '',
  note        text not null default '',
  location    text not null default '',
  state       text not null default '',
  lat         double precision,
  lng         double precision,
  occurred_at timestamptz not null,
  source_url  text,                       -- link back to the official record
  created_at  timestamptz not null default now()
);
create index if not exists expenditures_occurred_idx on expenditures (occurred_at desc);
create index if not exists expenditures_mp_idx on expenditures (mp_id);
create index if not exists expenditures_state_idx on expenditures (state);

-- Email subscribers ----------------------------------------------------------
create table if not exists subscriptions (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  scope       text not null default 'all',   -- 'all' | 'mp' | 'state'
  scope_value text,                          -- mp_id or state name; null for 'all'
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (email, scope, scope_value)
);

-- Web-push subscribers -------------------------------------------------------
create table if not exists push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  subscription jsonb not null,               -- the browser PushSubscription
  scope        text not null default 'all',
  scope_value  text,
  created_at   timestamptz not null default now()
);

-- Public comments on a state's spending --------------------------------------
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  state_slug  text not null,
  author      text not null default 'Anonymous',
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists comments_state_idx on comments (state_slug, created_at desc);

-- Citizen satisfaction poll votes -------------------------------------------
create table if not exists poll_votes (
  id         uuid primary key default gen_random_uuid(),
  subject    text not null,          -- 'rep-<id>' or 'mla-<id>'
  satisfied  boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists poll_votes_subject_idx on poll_votes (subject);

-- Row-level security: anyone can read public data; nobody writes via anon key.
alter table mps enable row level security;
alter table expenditures enable row level security;
alter table subscriptions enable row level security;
alter table push_subscriptions enable row level security;
alter table comments enable row level security;

create policy "public read mps" on mps for select using (true);
create policy "public read expenditures" on expenditures for select using (true);
create policy "public read comments" on comments for select using (true);
create policy "public read poll" on poll_votes for select using (true);
-- comments are inserted only via the service role (API route), which lets us
-- add validation/moderation server-side rather than trusting the client.
-- subscriptions / push_subscriptions: no anon policies => writes go through the
-- service role only (the API routes). Reads of subscriber data stay private.

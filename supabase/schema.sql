-- TLA Platform — database schema (Supabase / Postgres)
-- The control plane for all of Tyler's AI tools. Designed multi-tool from day
-- one: the receptionist is just the first `tool`; future tools reuse the same
-- clients / deployments / events tables.
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── tools: each AI product Tyler offers ─────────────────────
create table if not exists tools (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,          -- 'receptionist'
  name        text not null,                 -- 'AI Receptionist'
  description text,
  created_at  timestamptz not null default now()
);

-- ── clients: the businesses Tyler serves ────────────────────
create table if not exists clients (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,        -- 'example-plumbing' (matches old JSON clientId)
  business_name text not null,
  industry      text not null,               -- dental | legal | trades | clinic | generic
  contact_email text,
  contact_phone text,
  status        text not null default 'active', -- active | paused | churned
  created_at    timestamptz not null default now()
);

-- ── deployments: a tool running for a client (+ its config) ──
-- The receptionist reads its per-client config from here instead of JSON.
create table if not exists deployments (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients(id) on delete cascade,
  tool_id          uuid not null references tools(id) on delete restrict,
  config           jsonb not null default '{}', -- hours, services, faqs, capabilities, voiceId, overrides...
  vapi_assistant_id text,                        -- for the receptionist tool
  phone_numbers    text[] not null default '{}', -- dialled numbers that route here
  status           text not null default 'active',
  created_at       timestamptz not null default now(),
  unique (client_id, tool_id)
);

-- ── subscriptions: what a client pays → revenue / MRR ───────
create table if not exists subscriptions (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  amount_pence integer not null,             -- store money as integer pence
  currency     text not null default 'GBP',
  interval     text not null default 'month',-- month | year
  status       text not null default 'active',-- active | paused | cancelled
  started_at   date not null default current_date,
  created_at   timestamptz not null default now()
);

-- ── call_logs: every call the receptionist handles ──────────
create table if not exists call_logs (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references clients(id) on delete set null,
  deployment_id  uuid references deployments(id) on delete set null,
  vapi_call_id   text unique,
  started_at     timestamptz,
  duration_sec   numeric,
  cost_usd       numeric,
  ended_reason   text,
  summary        text,
  outcome        text,                        -- booked | message | transferred | info | missed
  transcript     jsonb,
  created_at     timestamptz not null default now()
);

-- ── events: generic per-tool activity (any future tool logs here) ──
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete set null,
  tool_id     uuid references tools(id) on delete set null,
  type        text not null,                  -- 'booking' | 'message' | 'transfer' | custom
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ── Helpful indexes ─────────────────────────────────────────
create index if not exists idx_call_logs_client   on call_logs(client_id, created_at desc);
create index if not exists idx_events_client       on events(client_id, created_at desc);
create index if not exists idx_deployments_client  on deployments(client_id);

-- ── Seed the receptionist tool ──────────────────────────────
insert into tools (slug, name, description)
values ('receptionist', 'AI Receptionist', 'AI voice receptionist that answers calls, books, takes messages and transfers.')
on conflict (slug) do nothing;

-- ── Row Level Security ──────────────────────────────────────
-- Only Tyler logs into the dashboard; the webhook uses the service-role key
-- (which bypasses RLS). So: enable RLS, allow any authenticated user to read
-- everything (single-operator app). Tighten later if you ever add team members.
alter table tools         enable row level security;
alter table clients       enable row level security;
alter table deployments   enable row level security;
alter table subscriptions enable row level security;
alter table call_logs     enable row level security;
alter table events        enable row level security;

drop policy if exists authed_read on tools;
create policy authed_read on tools for select to authenticated using (true);
drop policy if exists authed_read on clients;
create policy authed_read on clients for select to authenticated using (true);
drop policy if exists authed_read on deployments;
create policy authed_read on deployments for select to authenticated using (true);
drop policy if exists authed_read on subscriptions;
create policy authed_read on subscriptions for select to authenticated using (true);
drop policy if exists authed_read on call_logs;
create policy authed_read on call_logs for select to authenticated using (true);
drop policy if exists authed_read on events;
create policy authed_read on events for select to authenticated using (true);

-- ============================================================================
-- 006 — Editable packages
-- ============================================================================
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Stores the package edits made in the admin panel. A package with no row
-- here simply uses its built-in default (src/lib/packages/data.ts), so this
-- table starts empty and nothing changes until someone saves an edit.
-- `tiers` holds the whole tier list (label, discount %, line items) as JSON.
-- Written by the server (service role) only; no public access.
-- ============================================================================

create table if not exists packages (
  slug text primary key,
  name text not null,
  description text not null default '',
  tiers jsonb not null,
  updated_at timestamptz not null default now()
);
alter table packages enable row level security;

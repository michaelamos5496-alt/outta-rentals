-- ============================================================================
-- 002 — Enquiries (contact form + consultation requests)
-- ============================================================================
-- Run once in Supabase → SQL Editor (already included in schema.sql for fresh
-- installs). Safe to re-run.
--
-- A record of every message sent through the site's Contact form and
-- consultation popup, kept in case the WhatsApp conversation is lost.
-- Written by the server (service role) only; no public access.
-- ============================================================================

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'consultation')),
  name text,
  email text,
  phone text,
  message text,
  created_at timestamptz not null default now()
);
alter table enquiries enable row level security;
create index if not exists enquiries_created_at_idx on enquiries (created_at desc);

-- ============================================================================
-- 005 — Archived products
-- ============================================================================
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- "Archived" is distinct from `status` (available/unavailable/maintenance/…):
-- status says whether an active listing can be booked right now, while
-- archived removes it from the site entirely (the admin Products page's
-- Archive action). Null/false = shown as normal.
-- ============================================================================

alter table products add column if not exists archived boolean not null default false;

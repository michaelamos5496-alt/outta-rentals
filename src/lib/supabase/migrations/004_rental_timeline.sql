-- ============================================================================
-- 004 — Rental timeline (pickup / return tracking)
-- ============================================================================
-- Run once in Supabase → SQL Editor (already included in schema.sql for fresh
-- installs). Safe to re-run.
--
-- When the equipment on a confirmed order actually went out and came back,
-- recorded with one tap in admin. Drives the order timeline, overdue flags
-- and reminders. `delivery_method` (pickup/delivery) already exists.
-- ============================================================================

alter table quote_requests add column if not exists picked_up_at timestamptz;
alter table quote_requests add column if not exists returned_at timestamptz;

-- ============================================================================
-- 003 — Saved stock status per item
-- ============================================================================
-- Run once in Supabase → SQL Editor (already included in schema.sql for fresh
-- installs). Safe to re-run.
--
-- The admin Inventory page's status (Available / Maintenance / …) is stored
-- here and overrides the catalogue default on the live site. Null = use the
-- catalogue default.
-- ============================================================================

alter table product_stock add column if not exists status text
  check (status in ('available', 'reserved', 'maintenance', 'coming_soon', 'unavailable'));

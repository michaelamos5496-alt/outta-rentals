-- ============================================================================
-- OUTTA RENTALS — Supabase / PostgreSQL schema direction
-- ============================================================================
-- Phase 1 scope: this file documents the intended table shapes and
-- relationships so later phases can implement the real migrations. It is
-- NOT executed automatically and no Supabase project is connected yet.
-- Mirrors the TypeScript types in `src/types/index.ts`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- Catalogue
-- ------------------------------------------------------------------

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references categories (id) on delete set null,
  image_url text
);

-- Product-level status. Distinct from the per-date `availability` table below:
-- this is the current operational state of the unit(s) ("is this product
-- offered at all right now"), while `availability`/`rental_bookings` answer
-- "is it free for these specific dates."
create type product_status as enum (
  'available',
  'unavailable',
  'maintenance',
  'reserved',
  'coming_soon'
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  brand_id uuid references brands (id) on delete restrict,
  category_id uuid references categories (id) on delete restrict,
  short_description text not null,
  description text,
  status product_status not null default 'available',
  stock_quantity int not null default 1 check (stock_quantity >= 0),
  tags text[] not null default '{}',
  included text[] not null default '{}', -- "what's included" bullet list
  featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on products (category_id);
create index products_brand_id_idx on products (brand_id);
create index products_tags_idx on products using gin (tags);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text not null,
  is_primary boolean not null default false,
  "order" int not null default 0
);

create table product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  label text not null,
  value text not null,
  unit text,
  "group" text,
  "order" int not null default 0
);

create table product_accessories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  accessory_product_id uuid not null references products (id) on delete cascade,
  included boolean not null default true,
  quantity int not null default 1
);

create table product_compatibility (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  compatible_product_id uuid not null references products (id) on delete cascade,
  note text
);

create table rental_rates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  period text not null check (period in ('day', 'weekend', 'week', 'month')),
  price numeric(10, 2) not null,
  currency text not null default 'USD',
  discount_percent numeric(5, 2)
);

create table availability (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  date date not null,
  status product_status not null default 'available',
  quantity_available int not null default 0,
  unique (product_id, date)
);

-- ------------------------------------------------------------------
-- Customers
-- ------------------------------------------------------------------
-- Defined before `kit_lists` since kit_lists references it.

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Admin
-- ------------------------------------------------------------------
-- Defined here (not at the end) since `quote_notes` references it below.
-- Provisioning is manual (Supabase dashboard) — this app has no admin
-- signup flow. `id` matches the corresponding Supabase Auth user's id.

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  -- Stored lowercase: `getAdminSession()` matches it exactly against the
  -- signed-in Supabase Auth user's email.
  email text not null unique check (email = lower(email)),
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff'))
);

-- ------------------------------------------------------------------
-- Kit lists (build-a-kit)
-- ------------------------------------------------------------------

create table kit_lists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers (id) on delete set null,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references kit_lists (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity int not null default 1,
  rental_days int
);

-- ------------------------------------------------------------------
-- Quotes, orders
-- ------------------------------------------------------------------

-- Anonymous/guest quote requests from the Phase 5 quote wizard. `customer_id`
-- and `kit_id` stay nullable so a request can be captured before an account
-- or a normalized `kit_lists` row exists; `kit_snapshot` preserves what was
-- actually requested independent of later catalogue changes. Once accounts
-- and saved kits exist, new submissions can populate `customer_id`/`kit_id`
-- and treat the flat columns below as the guest-checkout fallback.
create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers (id) on delete set null,
  kit_id uuid references kit_lists (id) on delete set null,
  -- Nullable: a Send Kit request can arrive before the customer picks dates.
  start_date date,
  end_date date,
  rental_days int,
  estimated_total numeric(10, 2),
  kit_snapshot jsonb not null, -- [{ productSlug, productName, quantity, dayRate }]
  project_name text,
  project_type text,
  shoot_location text,
  production_days int,
  crew_size int,
  project_description text,
  customer_name text,
  customer_company text,
  customer_email text,
  customer_phone text,
  customer_whatsapp text,
  delivery_method text check (delivery_method in ('pickup', 'delivery')),
  delivery_location text,
  delivery_instructions text,
  -- Matches the admin dashboard's quote pipeline (Phase 9): New → Reviewing
  -- → Quoted → Confirmed → Completed, with Cancelled off that path at any point.
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'quoted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Internal admin notes on a quote request (Phase 9 dashboard). Never
-- exposed to the customer — service-role only, same as `quote_requests`
-- reads.
create table quote_notes (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references quote_requests (id) on delete cascade,
  author_id uuid references admin_users (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete restrict,
  kit_id uuid references kit_lists (id) on delete set null,
  quote_request_id uuid references quote_requests (id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'out', 'returned', 'cancelled')),
  start_date date not null,
  end_date date not null,
  total numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Rental bookings — the source of truth for date-range availability.
--
-- Double-booking is avoided in two layers:
--   1. `get_available_quantity()` sums active (held/confirmed) bookings
--      that overlap the requested range and subtracts from stock, so the
--      application never *offers* a date range it can't fulfill.
--   2. Creating a booking must happen inside a transaction that re-checks
--      the same query with `SELECT ... FOR UPDATE` on the relevant
--      `products` row (or `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`)
--      before inserting — a plain check-then-insert from the app server is
--      not concurrency-safe on its own. This function is the check; the
--      transaction wrapper is the guarantee, and belongs in the booking
--      creation code path (not implemented yet — no checkout/booking
--      confirmation flow exists in the app as of this phase).
-- ------------------------------------------------------------------

create table rental_bookings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  order_id uuid references orders (id) on delete cascade,
  quote_request_id uuid references quote_requests (id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  status text not null default 'held' check (status in ('held', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index rental_bookings_product_dates_idx
  on rental_bookings (product_id, start_date, end_date)
  where status in ('held', 'confirmed');

create or replace function get_available_quantity(p_product_id uuid, p_start date, p_end date)
returns int
language sql
stable
as $$
  select greatest(
    (select stock_quantity from products where id = p_product_id) -
    coalesce((
      select sum(quantity) from rental_bookings
      where product_id = p_product_id
        and status in ('held', 'confirmed')
        and start_date <= p_end
        and end_date >= p_start
    ), 0),
  0);
$$;

create or replace function is_product_available(
  p_product_id uuid, p_start date, p_end date, p_quantity int default 1
)
returns boolean
language sql
stable
as $$
  select get_available_quantity(p_product_id, p_start, p_end) >= p_quantity
    and (select status from products where id = p_product_id) = 'available';
$$;

-- ------------------------------------------------------------------
-- Marketing / content
-- ------------------------------------------------------------------

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  icon_name text
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  cover_image_url text not null,
  client_name text,
  published_at timestamptz
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  author_company text,
  quote text not null,
  avatar_url text,
  project_id uuid references projects (id) on delete set null
);


-- ============================================================================
-- Row Level Security
-- ============================================================================
-- All application reads/writes from the Next.js app go through either:
--   - the anon key (browser-safe, subject to RLS below), or
--   - the service role key (server-only, e.g. `recordKitRequest`; BYPASSES
--     RLS entirely by design). Never expose the service role key to the
--     client — it already lives only in `SUPABASE_SERVICE_ROLE_KEY`, a
--     server-only env var (see `src/lib/supabase/server.ts`).
--
-- Tables with no policies below are intentionally locked to service-role
-- access only: enabling RLS with zero policies denies all anon/authenticated
-- access by default.
-- ============================================================================

alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_specifications enable row level security;
alter table product_accessories enable row level security;
alter table product_compatibility enable row level security;
alter table rental_rates enable row level security;
alter table availability enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table testimonials enable row level security;

alter table customers enable row level security;
alter table quote_requests enable row level security;
alter table quote_notes enable row level security;
alter table orders enable row level security;
alter table kit_lists enable row level security;
alter table kit_items enable row level security;
alter table rental_bookings enable row level security;
alter table admin_users enable row level security;

-- ---- Public storefront reads --------------------------------------------

create policy "Public read access" on brands for select using (true);
create policy "Public read access" on categories for select using (true);
create policy "Public read access" on products for select using (true);
create policy "Public read access" on product_images for select using (true);
create policy "Public read access" on product_specifications for select using (true);
create policy "Public read access" on product_accessories for select using (true);
create policy "Public read access" on product_compatibility for select using (true);
create policy "Public read access" on rental_rates for select using (true);
create policy "Public read access" on availability for select using (true);
create policy "Public read access" on services for select using (true);
create policy "Public read access" on testimonials for select using (true);

-- Only published projects are public; unpublished drafts stay service-role only.
create policy "Published projects are public" on projects
  for select using (published_at is not null and published_at <= now());

-- ---- Quote requests (Send Kit orders) -----------------------------------------
-- No public policies: requests are written by the server (`recordKitRequest`,
-- service role, validated input) and read only by the admin dashboard, so the
-- public API can neither read them nor insert arbitrary rows.

create index quote_requests_created_at_idx on quote_requests (created_at desc);
create index quote_notes_quote_idx on quote_notes (quote_request_id);

-- ---- Everything else: service-role only ------------------------------------
-- `customers`, `orders`, `kit_lists`, `kit_items`, `rental_bookings`,
-- `quote_notes` and `admin_users` have RLS enabled above with no policies,
-- so anon/authenticated access is denied entirely — the admin dashboard
-- (Phase 9) reads and writes them via the service role only, gated by
-- `getAdminSession()` in application code (`src/lib/admin/auth.ts`), not by
-- a customer-facing RLS policy. Once customer accounts exist, add
-- owner-scoped policies here, e.g.:
--   create policy "Customers read their own orders" on orders
--     for select to authenticated using (customer_id = auth.uid());
-- and equivalents for `kit_lists`/`kit_items` scoped by `customer_id`.

-- ============================================================================
-- Notes for later phases
-- ============================================================================
-- * `products` is the aggregate root; `product_images`,
--   `product_specifications`, `rental_rates`, and `availability` all key
--   off it and are safe to query with Supabase's nested select syntax,
--   matching the shape of the `Product` TypeScript type.
-- * Junction tables (`product_accessories`, `product_compatibility`) are
--   self-referencing against `products` for "included with" / "works with"
--   relationships shown on product detail pages.
-- * `kit_lists`/`kit_items` mirror the shape of the app's local-storage kit
--   (`src/lib/kit/types.ts`: productSlug + quantity) closely enough that
--   migrating the client-side kit to these tables is mostly plumbing once
--   auth exists — see `src/lib/kit/storage.ts` for the abstraction point.

-- ============================================================================
-- 001 — Bookings from confirmed orders
-- ============================================================================
-- Run once in Supabase → SQL Editor (already included in schema.sql for fresh
-- installs). Safe to re-run.
--
-- The storefront catalogue is static (src/lib/catalogue/products.ts), so
-- bookings and stock are keyed by product slug rather than products.id.
-- ============================================================================

-- Units OUTTA owns of each item. Items with no row count as 1 unit.
create table if not exists product_stock (
  product_slug text primary key,
  units int not null default 1 check (units >= 0),
  updated_at timestamptz not null default now()
);
alter table product_stock enable row level security;

alter table rental_bookings alter column product_id drop not null;
alter table rental_bookings add column if not exists product_slug text;
create index if not exists rental_bookings_slug_dates_idx
  on rental_bookings (product_slug, start_date, end_date)
  where status in ('held', 'confirmed');
create index if not exists rental_bookings_quote_idx on rental_bookings (quote_request_id);

-- Changes an order's status and keeps its bookings in step, atomically:
--   * → confirmed: checks every kit line against overlapping confirmed
--     bookings of OTHER orders and the units owned. Any clash → nothing
--     changes and the clashes are returned. Otherwise the order's equipment
--     is booked for its dates.
--   * → anything else: the order's bookings are removed, freeing the dates.
-- A transaction-level advisory lock serialises confirmations so two admins
-- can't double-book the same units at the same moment.
create or replace function set_quote_status(p_quote_id uuid, p_status text)
returns jsonb
language plpgsql
as $$
declare
  q quote_requests%rowtype;
  line jsonb;
  v_slug text;
  v_name text;
  v_qty int;
  v_units int;
  v_booked int;
  conflicts jsonb := '[]'::jsonb;
begin
  if p_status not in ('new', 'reviewing', 'quoted', 'confirmed', 'completed', 'cancelled') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  perform pg_advisory_xact_lock(hashtext('outta_bookings'));

  select * into q from quote_requests where id = p_quote_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if p_status = 'confirmed' then
    if q.start_date is null or q.end_date is null then
      return jsonb_build_object('ok', false, 'error', 'no_dates');
    end if;

    for line in select * from jsonb_array_elements(q.kit_snapshot) loop
      v_slug := line ->> 'productSlug';
      v_name := coalesce(line ->> 'productName', v_slug);
      v_qty := greatest(coalesce((line ->> 'quantity')::int, 1), 1);
      v_units := coalesce((select units from product_stock where product_slug = v_slug), 1);
      v_booked := coalesce((
        select sum(quantity) from rental_bookings
        where product_slug = v_slug
          and status in ('held', 'confirmed')
          and quote_request_id is distinct from p_quote_id
          and start_date <= q.end_date
          and end_date >= q.start_date
      ), 0);
      if v_booked + v_qty > v_units then
        conflicts := conflicts || jsonb_build_object(
          'productName', v_name,
          'requested', v_qty,
          'available', greatest(v_units - v_booked, 0)
        );
      end if;
    end loop;

    if jsonb_array_length(conflicts) > 0 then
      return jsonb_build_object('ok', false, 'error', 'conflict', 'conflicts', conflicts);
    end if;

    delete from rental_bookings where quote_request_id = p_quote_id;
    insert into rental_bookings (product_slug, quote_request_id, quantity, start_date, end_date, status)
    select l ->> 'productSlug',
           p_quote_id,
           greatest(coalesce((l ->> 'quantity')::int, 1), 1),
           q.start_date,
           q.end_date,
           'confirmed'
    from jsonb_array_elements(q.kit_snapshot) as l;
  else
    delete from rental_bookings where quote_request_id = p_quote_id;
  end if;

  update quote_requests set status = p_status where id = p_quote_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Only the server (service role) may call it.
revoke execute on function set_quote_status(uuid, text) from public, anon, authenticated;

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

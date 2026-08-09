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

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  brand_id uuid references brands (id) on delete restrict,
  category_id uuid references categories (id) on delete restrict,
  short_description text not null,
  description text,
  featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  status text not null check (status in ('available', 'reserved', 'maintenance', 'unavailable')),
  quantity_available int not null default 0,
  unique (product_id, date)
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
-- Customers, quotes, orders
-- ------------------------------------------------------------------

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

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
  start_date date not null,
  end_date date not null,
  rental_days int not null,
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
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'quoted', 'converted', 'declined')),
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

-- ------------------------------------------------------------------
-- Admin
-- ------------------------------------------------------------------

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff'))
);

-- ------------------------------------------------------------------
-- Notes for later phases
-- ------------------------------------------------------------------
-- * Row Level Security is intentionally not defined yet — Phase 1 has no
--   auth. When auth lands, enable RLS on every table above and scope
--   customer-facing reads to published/available rows only.
-- * `products` is the aggregate root; `product_images`,
--   `product_specifications`, `rental_rates`, and `availability` all key
--   off it and are safe to query with Supabase's nested select syntax,
--   matching the shape of the `Product` TypeScript type.
-- * Junction tables (`product_accessories`, `product_compatibility`) are
--   self-referencing against `products` for "included with" / "works with"
--   relationships shown on product detail pages in a later phase.

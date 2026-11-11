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

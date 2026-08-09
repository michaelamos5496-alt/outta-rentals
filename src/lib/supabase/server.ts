import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (route handlers, server components, actions).
 * Uses the service role key so it can bypass RLS for trusted server-only
 * operations — see the RLS section of `schema.sql` for what that means
 * per table.
 *
 * Returns `null` until a Supabase project is actually connected (no
 * `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set yet). Callers
 * are expected to fall back to demo data when this returns `null` — see
 * `src/lib/catalogue/db.ts`.
 *
 * Untyped on purpose: without a live project there's no way to run
 * `supabase gen types`, and hand-rolled generics for nested/embedded
 * selects (joins) are brittle without it. Call sites in `db.ts` cast
 * query results against local interfaces that mirror `schema.sql`
 * instead — swap in generated types once a real project exists.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

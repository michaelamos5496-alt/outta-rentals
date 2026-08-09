import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (route handlers, server components, actions).
 * Uses the service role key when present so it can bypass RLS for trusted
 * server-only operations once auth/RLS is introduced in a later phase.
 *
 * Returns `null` in Phase 1 since no Supabase project is connected yet.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

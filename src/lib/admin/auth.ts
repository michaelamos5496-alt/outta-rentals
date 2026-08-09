"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const DEMO_COOKIE = "outta-admin-demo";

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render, not an action — safe to
          // ignore, middleware refreshes the session cookie on navigation.
        }
      },
    },
  });
}

export interface AdminSession {
  email: string;
  /** True when running the dev-only, no-Supabase demo bypass — never true in production. */
  demo: boolean;
}

/**
 * Resolves the current admin session.
 *
 * Real path: Supabase Auth via `@supabase/ssr`, subject to `admin_users`
 * existing as the source of truth for who's allowed to sign in (provisioned
 * manually in the Supabase dashboard — this app has no admin signup flow by
 * design).
 *
 * Demo path: when no Supabase project is connected, a cookie-based bypass
 * gated on `ADMIN_DEMO_EMAIL`/`ADMIN_DEMO_PASSWORD` env vars AND
 * `NODE_ENV !== "production"`. Unset either condition and this always
 * returns `null` — see `signInAdmin` and `src/middleware.ts`.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (supabaseConfigured()) {
    const supabase = await getServerSupabase();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user?.email ? { email: data.user.email, demo: false } : null;
  }

  if (process.env.NODE_ENV === "production") return null;

  const demoEmail = process.env.ADMIN_DEMO_EMAIL;
  if (!demoEmail) return null;

  const cookieStore = await cookies();
  const demoAuthed = cookieStore.get(DEMO_COOKIE)?.value === "1";
  return demoAuthed ? { email: demoEmail, demo: true } : null;
}

export type SignInResult = { ok: true } | { ok: false; error: string };

export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  if (!email.trim() || !password.trim()) {
    return { ok: false, error: "Enter an email and password." };
  }

  if (supabaseConfigured()) {
    const supabase = await getServerSupabase();
    if (!supabase) return { ok: false, error: "Auth is not available." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Admin sign-in is not configured." };
  }

  const demoEmail = process.env.ADMIN_DEMO_EMAIL;
  const demoPassword = process.env.ADMIN_DEMO_PASSWORD;
  if (!demoEmail || !demoPassword) {
    return {
      ok: false,
      error:
        "No Supabase project connected and demo credentials aren't set (ADMIN_DEMO_EMAIL / ADMIN_DEMO_PASSWORD).",
    };
  }
  if (email !== demoEmail || password !== demoPassword) {
    return { ok: false, error: "Invalid email or password." };
  }

  // This branch only runs when NODE_ENV !== "production" (checked above),
  // so `secure` is always false here — that's expected for local dev.
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return { ok: true };
}

export async function signOutAdmin(): Promise<void> {
  if (supabaseConfigured()) {
    const supabase = await getServerSupabase();
    await supabase?.auth.signOut();
  }
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}

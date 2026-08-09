import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEMO_COOKIE = "outta-admin-demo";

/**
 * Protects every `/admin/*` route (except the login page itself).
 *
 * - Supabase connected: requires a valid Supabase Auth session.
 * - No Supabase, non-production: allows the demo-mode cookie set by
 *   `signInAdmin` (see `src/lib/admin/auth.ts`), which itself only works
 *   when `ADMIN_DEMO_EMAIL`/`ADMIN_DEMO_PASSWORD` are set.
 * - No Supabase, production: admin is completely inaccessible — redirected
 *   home, no bypass exists in this branch at all.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  if (process.env.NODE_ENV !== "production") {
    const demoAuthed = request.cookies.get(DEMO_COOKIE)?.value === "1";
    if (!demoAuthed) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};

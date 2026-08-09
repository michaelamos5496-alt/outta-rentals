import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TriangleAlert } from "lucide-react";

import { getAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const metadata = {
  title: {
    default: "OUTTA Admin",
    template: "%s — OUTTA Admin",
  },
  robots: { index: false, follow: false },
};

// Never statically cache admin pages — every request must re-run the
// session check above, not serve a build-time (or edge-cached) snapshot.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {session.demo ? (
        <div className="flex items-center justify-center gap-2 bg-brand/10 px-4 py-2 text-center text-xs text-brand">
          <TriangleAlert className="size-3.5 shrink-0" />
          Demo mode — no Supabase project connected. This bypass only runs
          outside production and never applies once real credentials are set.
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-56 shrink-0 border-r border-border p-4 lg:block">
          <Link href="/admin" className="mb-6 block px-3 font-heading text-base font-semibold">
            OUTTA<span className="text-brand">.</span> Admin
          </Link>
          <AdminSidebar />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-border px-6 py-3">
            <p className="text-small">{session.email}</p>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-small hover:text-foreground" target="_blank">
                View site ↗
              </Link>
              <SignOutButton />
            </div>
          </header>
          <div className="border-b border-border px-3 py-2 lg:hidden">
            <AdminSidebar variant="horizontal" />
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

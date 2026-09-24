import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TriangleAlert } from "lucide-react";

import { getAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminAccount } from "@/components/admin/admin-account";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminAlertsProvider } from "@/components/admin/admin-alerts";

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
    <AdminAlertsProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-brand p-4 text-brand-foreground lg:flex">
            <Link href="/admin" className="mb-8 block px-2 pt-2" aria-label="Admin dashboard">
              <Image
                src="/brand/outta-logo-dark.png"
                alt="OUTTA Rentals"
                width={595}
                height={225}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AdminSidebar />
            </div>
            <AdminAccount email={session.email} />
          </aside>

          <div className="min-w-0 flex-1">
            <AdminMobileNav email={session.email} />
            {session.demo ? (
              <div className="flex items-center justify-center gap-2 bg-brand/10 px-4 py-2 text-center text-xs text-brand">
                <TriangleAlert className="size-3.5 shrink-0" />
                Demo mode — no Supabase project connected. This bypass only runs
                outside production and never applies once real credentials are set.
              </div>
            ) : null}
            <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </AdminAlertsProvider>
  );
}

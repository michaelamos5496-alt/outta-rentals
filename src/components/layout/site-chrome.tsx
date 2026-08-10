"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { KitDrawer } from "@/components/kit/kit-drawer";
import { FloatingKitButton } from "@/components/kit/floating-kit-button";

/**
 * The admin backend has its own header/sidebar chrome (see
 * `src/app/admin/(dashboard)/layout.tsx`) — the public storefront's navbar,
 * footer and kit UI don't belong there and were leaking onto every admin
 * page since both live under the same root layout.
 */
function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) return <>{children}</>;

  const page = (
    <>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      {isHome ? page : <SmoothScroll>{page}</SmoothScroll>}
      <KitDrawer />
      <FloatingKitButton />
    </>
  );
}

export { SiteChrome };

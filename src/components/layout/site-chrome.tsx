"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { MobileNavProvider } from "@/components/layout/mobile-nav-provider";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { KitDrawer } from "@/components/kit/kit-drawer";

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

  // The mobile tab bar (or, on product pages, the sticky rent bar) is fixed
  // to the bottom of the viewport — the footer needs its own clearance so
  // its last line isn't covered by either, since padding on `main` only
  // creates space *before* the footer, not after it.
  const page = (
    <>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );

  return (
    <MobileNavProvider>
      <Navbar />
      {isHome ? page : <SmoothScroll>{page}</SmoothScroll>}
      <KitDrawer />
      <MobileTabBar />
    </MobileNavProvider>
  );
}

export { SiteChrome };

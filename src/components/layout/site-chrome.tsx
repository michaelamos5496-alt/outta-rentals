"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { MobileNavProvider } from "@/components/layout/mobile-nav-provider";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { KitDrawer } from "@/components/kit/kit-drawer";
import { categories } from "@/lib/catalogue";

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
  const equipmentSegment = pathname?.startsWith("/equipment/")
    ? pathname.split("/")[2]
    : undefined;
  const isProductPage = equipmentSegment && !categories.some((c) => c.slug === equipmentSegment);

  if (isAdmin) return <>{children}</>;

  const page = (
    <>
      <main className={isProductPage ? "flex-1" : "flex-1 pb-20 lg:pb-0"}>{children}</main>
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

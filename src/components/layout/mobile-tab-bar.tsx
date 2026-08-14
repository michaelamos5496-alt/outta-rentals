"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, MessageCircle, Package, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { categories } from "@/lib/catalogue";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { useKit } from "@/components/kit/kit-provider";
import { useMobileNav } from "@/components/layout/mobile-nav-provider";

// Persistent bottom app-bar for mobile — modeled on MCB Rentals' mobile tab
// bar (Home / Equipment / WhatsApp / Cart / More), reskinned in OUTTA's dark
// + brand-green language. Hidden on product detail pages, which already
// have their own sticky Rent Now bar in the same screen real estate.
function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount, openDrawer, hydrated } = useKit();
  const { open, setOpen } = useMobileNav();

  const equipmentSegment = pathname?.startsWith("/equipment/")
    ? pathname.split("/")[2]
    : undefined;
  const isProductPage = equipmentSegment && !categories.some((c) => c.slug === equipmentSegment);
  if (isProductPage || pathname?.startsWith("/admin")) return null;

  const whatsappLink = getWhatsAppLink({
    closingLine: "I'd like to talk about an upcoming shoot.",
  });

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
    >
      <div className="grid grid-cols-5 items-end px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 py-1 text-[0.625rem] font-medium tracking-wide uppercase",
            pathname === "/" ? "text-brand" : "text-muted-foreground"
          )}
        >
          <Home className="size-5" strokeWidth={1.75} />
          Home
        </Link>
        <Link
          href="/equipment"
          className={cn(
            "flex flex-col items-center gap-1 py-1 text-[0.625rem] font-medium tracking-wide uppercase",
            pathname?.startsWith("/equipment") ? "text-brand" : "text-muted-foreground"
          )}
        >
          <Video className="size-5" strokeWidth={1.75} />
          Equipment
        </Link>

        <a
          href={whatsappLink ?? "/quote"}
          target={whatsappLink ? "_blank" : undefined}
          rel={whatsappLink ? "noopener noreferrer" : undefined}
          className="-mt-5 flex flex-col items-center gap-1"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md">
            <MessageCircle className="size-5" strokeWidth={1.75} />
          </span>
        </a>

        <button
          type="button"
          aria-label="Open kit"
          onClick={openDrawer}
          className="relative flex flex-col items-center gap-1 py-1 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase"
        >
          <Package className="size-5" strokeWidth={1.75} />
          Kit
          {hydrated && itemCount > 0 ? (
            <span className="absolute -top-0.5 right-1/2 translate-x-3.5 flex size-3.5 items-center justify-center rounded-full border border-background bg-brand text-[0.5625rem] font-medium text-brand-foreground">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(!open)}
          className="flex flex-col items-center gap-1 py-1 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase"
        >
          <Menu className="size-5" strokeWidth={1.75} />
          Menu
        </button>
      </div>
    </nav>
  );
}

export { MobileTabBar };

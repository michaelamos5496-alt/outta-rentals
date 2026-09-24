"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, MessageCircle, ShoppingCart, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { categories } from "@/lib/catalogue";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { useKit } from "@/components/kit/kit-provider";
import { useMobileNav } from "@/components/layout/mobile-nav-provider";

// Persistent bottom app-bar for mobile — modeled on MCB Rentals' mobile tab
// bar (Home / Equipment / Cart / WhatsApp / More), reskinned in OUTTA's dark
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
  if (isProductPage || pathname?.startsWith("/admin") || pathname === "/kit") return null;

  const whatsappLink = getWhatsAppLink({
    heading: "OUTTA RENTALS — ENQUIRY",
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

        <button
          type="button"
          aria-label={itemCount > 0 ? `Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}` : "Open cart"}
          onClick={openDrawer}
          className="relative -mt-5 flex flex-col items-center gap-1"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-md active:scale-95">
            <ShoppingCart className="size-5" strokeWidth={1.75} />
          </span>
          {hydrated && itemCount > 0 ? (
            <span className="absolute -top-1 right-1/2 flex size-5 translate-x-6 items-center justify-center rounded-full border-2 border-background bg-foreground text-[0.625rem] font-bold text-background">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          ) : null}
        </button>

        <a
          href={whatsappLink ?? "/contact"}
          aria-label="Message OUTTA on WhatsApp"
          target={whatsappLink ? "_blank" : undefined}
          rel={whatsappLink ? "noopener noreferrer" : undefined}
          className="flex flex-col items-center gap-1 py-1 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase"
        >
          <MessageCircle className="size-5" strokeWidth={1.75} />
          WhatsApp
        </a>

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

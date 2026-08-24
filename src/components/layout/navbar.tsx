"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  ChevronDown,
  Clapperboard,
  Info,
  LoaderCircle,
  Mail,
  MessageCircle,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";
import gsap from "gsap";

import { cn } from "@/lib/utils";
import { duration, easeOutta } from "@/lib/motion";
import { siteConfig, type NavItem } from "@/config/site";
import { availabilityLabels, availabilityVariant } from "@/lib/catalogue";
import { searchCatalogueAction, type CatalogueSearchResult } from "@/lib/catalogue/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { useMobileNav } from "@/components/layout/mobile-nav-provider";
import { useKit } from "@/components/kit/kit-provider";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { formatPrice } from "@/lib/currency";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function NavbarSearch({ onNavigate }: { onNavigate: () => void }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<CatalogueSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);

  React.useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the async search; not derivable from render
    setLoading(true);
    searchCatalogueAction(q).then((res) => {
      if (!cancelled) {
        setResults(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery && !loading && results.length > 0;
  const showEmpty = trimmedQuery && !loading && results.length === 0;

  return (
    <div>
      <SearchInput
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-3 max-h-[60vh] overflow-y-auto">
        {trimmedQuery && loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            <span className="text-small">Searching…</span>
          </div>
        ) : showEmpty ? (
          <p className="text-small py-10 text-center">
            No equipment found for &ldquo;{trimmedQuery}&rdquo;.
          </p>
        ) : showResults ? (
          <ul className="flex flex-col divide-y divide-border">
            {results.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/equipment/${product.slug}`}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-small truncate">
                      {product.brandName} · {product.categoryName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-small font-mono whitespace-nowrap">
                      {formatPrice(product.dayRate, product.currency)}/day
                    </span>
                    <Badge variant={availabilityVariant[product.availability]}>
                      {availabilityLabels[product.availability]}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

// The real equipment taxonomy (all 12 real categories, every one reachable)
// collapsed into the client's requested tab set — Camera and Light each
// group a few closely related real categories under one tab. Rendered as
// flat, always-visible tabs in the main nav row (711rent-style), not
// hidden behind a single "Equipment" trigger.
interface EquipmentTab extends NavItem {
  children?: NavItem[];
}

const equipmentTabs: EquipmentTab[] = [
  {
    label: "Camera",
    href: "/equipment/cameras",
    children: [
      { label: "Body", href: "/equipment/cameras" },
      { label: "Monitoring", href: "/equipment/monitors" },
      { label: "Lens Control", href: "/equipment/camera-accessories" },
      { label: "Wireless Video", href: "/equipment/camera-accessories" },
      { label: "Matte Box", href: "/equipment/matte-boxes" },
      { label: "Filters", href: "/equipment/filters" },
    ],
  },
  { label: "Lens", href: "/equipment/lenses" },
  {
    label: "Light",
    href: "/equipment/lighting",
    children: [
      { label: "Lighting", href: "/equipment/lighting" },
      { label: "Modifiers", href: "/equipment/lighting-modifiers" },
    ],
  },
  { label: "Grip", href: "/equipment/grip" },
  { label: "Accessories", href: "/equipment/accessories" },
  { label: "Audio", href: "/equipment/audio" },
  { label: "Drone", href: "/equipment/drones" },
];

// Thin utility row up top, now a radial FAB instead of a plain link list —
// mirrors 711rent's Home/Rent/Contact/Service/News row in what it links to,
// fanned out from a single button instead. Row 2 (logo + category tabs)
// below is untouched.
const fabItems: (NavItem & { icon: React.ComponentType<{ className?: string; strokeWidth?: number }> })[] = [
  { label: "Services", href: "/services", icon: Briefcase },
  { label: "Work", href: "/work", icon: Clapperboard },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
];

/**
 * Floating FAB — fixed position, its own shadow and pill shape, detached
 * from the sticky header entirely. Hovering (or clicking, for keyboard/touch)
 * pops up a labeled list of the utility links above the button, animated in
 * with a GSAP stagger — panel scales/lifts in, list rows slide up in
 * sequence — rather than the harder-to-read icon-only radial fan this
 * replaced.
 */
function NavFab() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const iconWrapRef = React.useRef<HTMLSpanElement>(null);
  const timelineRef = React.useRef<gsap.core.Timeline | null>(null);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = React.useState(false);
  const whatsappLink = getWhatsAppLink({
    closingLine: "I'd like to talk about an upcoming shoot.",
  });

  const items = whatsappLink
    ? [...fabItems, { label: "WhatsApp", href: whatsappLink, icon: MessageCircle, external: true }]
    : fabItems;

  const open_ = React.useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    timelineRef.current?.play();
    setOpen(true);
  }, []);

  const close = React.useCallback(() => {
    timelineRef.current?.reverse();
    setOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    if (open) close();
    else open_();
  }, [open, close, open_]);

  const scheduleClose = React.useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(close, 200);
  }, [close]);

  React.useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const rows = Array.from(panel.querySelectorAll<HTMLElement>(".fab-row"));

    gsap.set(panel, { opacity: 0, scale: 0.92, y: 12, transformOrigin: "bottom right" });
    gsap.set(rows, { opacity: 0, y: 10 });

    const tl = gsap.timeline({ paused: true });
    tl.to(panel, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.7)" });
    tl.to(rows, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }, 0.08);

    if (iconWrapRef.current) {
      tl.to(iconWrapRef.current, { rotation: 135, duration: 0.3, ease: "back.out(1.7)" }, 0);
    }

    timelineRef.current = tl;
    return () => {
      tl.kill();
    };
  }, [items.length]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div ref={containerRef} className="fixed right-4 bottom-24 z-40 lg:right-6 lg:bottom-6">
      <div
        ref={panelRef}
        onMouseEnter={open_}
        onMouseLeave={scheduleClose}
        className={cn(
          "absolute right-0 bottom-full z-0 mb-3 flex w-48 flex-col gap-1 rounded-2xl bg-brand p-2 opacity-0 shadow-xl sm:w-56",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const external = "external" in item && item.external;
          return (
            <Link
              key={item.label}
              href={item.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={close}
              className="fab-row text-brand-foreground flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-foreground/10"
            >
              <Icon className="size-4 shrink-0" strokeWidth={2} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={toggle}
        onMouseEnter={open_}
        onMouseLeave={scheduleClose}
        className="bg-brand text-brand-foreground relative z-10 flex size-14 items-center justify-center rounded-full shadow-xl lg:size-16"
      >
        <span ref={iconWrapRef} className="flex items-center justify-center">
          <Plus className="size-5 lg:size-6" strokeWidth={2} aria-hidden />
        </span>
      </button>
    </div>
  );
}

// Mobile-only grouping of the nav. Grouped headers give the mobile panel
// scannability without changing what routes exist.
const mobileNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Equipment",
    items: [
      { label: "All Equipment", href: "/equipment" },
      ...equipmentTabs.map((tab) => ({ label: tab.label, href: tab.href })),
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Productions", href: "/work" },
      { label: "Shot With This Gear", href: "/work" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "About OUTTA", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

function Navbar() {
  const scrolled = useScrolled();
  const { open: mobileOpen, setOpen: setMobileOpen } = useMobileNav();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { itemCount, openDrawer, hydrated } = useKit();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // The homepage's hero is a full-bleed photo — the pill floats directly
  // over it (header taken out of flow entirely, hero starting at the true
  // top) so the actual hero image shows through the margin around the
  // pill, not a flat color standing in for it. Every other page has plain
  // white content right under the nav, where a floating header would
  // either show white through the gap or need its own opaque fill sitting
  // oddly on top of content, so those stay flush/sticky/in-flow instead.
  React.useEffect(() => {
    if (isHome) {
      document.documentElement.setAttribute("data-floating-nav", "true");
    } else {
      document.documentElement.removeAttribute("data-floating-nav");
    }
    return () => document.documentElement.removeAttribute("data-floating-nav");
  }, [isHome]);

  return (
    <header
      data-slot="navbar"
      className={cn(
        isHome
          ? "fixed top-0 inset-x-0 z-40 pt-3 pb-3 sm:pt-4 sm:pb-4"
          : "sticky top-0 z-40 w-full"
      )}
    >
      {/* Floating FAB — fixed to the viewport, detached from the header
          entirely (not stacked in a bar on top of the tabs below). */}
      <NavFab />

      {/* Category tabs bar — a floating rounded pill, detached from the
          viewport edge on every side (page background visible around it)
          rather than a full-width bar flush against the top. */}
      <Container>
        <div className="relative">
          <nav
            className={cn(
              "flex h-14 items-center justify-between gap-6 rounded-full bg-brand px-4 shadow-lg transition-shadow sm:h-16 sm:px-6",
              scrolled ? "shadow-xl" : ""
            )}
            style={{ transitionDuration: `${duration.fast * 1000}ms` }}
          >
            <Link href="/" className="inline-flex shrink-0 items-center">
              <Image
                src="/brand/outta-logo-dark.png"
                alt={siteConfig.name}
                width={595}
                height={225}
                priority
                className="h-8 w-auto sm:h-9"
              />
            </Link>

            <ul className="hidden h-full items-stretch gap-6 lg:flex">
              {equipmentTabs.map((tab) => (
                <li key={tab.href} className="group/tab relative flex h-full items-center">
                  <Link
                    href={tab.href}
                    className="text-label relative flex items-center gap-1 !text-brand-foreground whitespace-nowrap transition-colors hover:!text-brand-foreground"
                  >
                    {tab.label}
                    {tab.children ? (
                      <ChevronDown className="size-3" strokeWidth={2.5} aria-hidden />
                    ) : null}
                  </Link>

                  {tab.children ? (
                    <div className="pointer-events-none absolute top-full left-0 z-50 w-72 translate-y-1 pt-3 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/tab:pointer-events-auto group-hover/tab:translate-y-0 group-hover/tab:opacity-100">
                      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-background p-3 text-foreground shadow-lg">
                        {tab.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-brand"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
              >
                <Search />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Kit list"
                onClick={openDrawer}
                className="relative text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
              >
                <Package />
                {hydrated && itemCount > 0 ? (
                  <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full border border-brand bg-brand-foreground text-[0.5625rem] font-medium text-brand">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                ) : null}
              </Button>
              {/* No mobile hamburger here — the mobile tab bar's Menu tab opens
                  the same panel, so a second control in the header would be
                  redundant. */}
            </div>
          </nav>
        </div>
      </Container>

      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search equipment"
        description="Search the full catalogue by name, brand, category or tag."
        className="sm:max-w-lg"
      >
        <NavbarSearch onNavigate={() => setSearchOpen(false)} />
      </Modal>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease: easeOutta }}
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            <Container className="flex h-full flex-col overflow-y-auto pb-8">
              <div className="flex h-16 shrink-0 items-center justify-between sm:h-20">
                <Image
                  src="/brand/outta-logo.png"
                  alt={siteConfig.name}
                  width={595}
                  height={225}
                  className="h-8 w-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <nav className="mt-6 flex flex-col gap-7">
                {mobileNavGroups.map((group, gi) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: duration.base,
                      delay: gi * 0.05,
                      ease: easeOutta,
                    }}
                  >
                    <p className="text-label text-brand">{group.title}</p>
                    <ul className="mt-2 flex flex-col">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2.5 font-medium"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  <Search /> Search
                </Button>
                <Button
                  variant="outline"
                  className="relative flex-1"
                  onClick={() => {
                    setMobileOpen(false);
                    openDrawer();
                  }}
                >
                  <Package /> Kit
                  {hydrated && itemCount > 0 ? (
                    <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border border-background bg-brand text-[0.6875rem] font-medium text-brand-foreground">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  ) : null}
                </Button>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export { Navbar };

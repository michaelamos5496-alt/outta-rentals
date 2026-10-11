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
  ShoppingCart,
  Plus,
  Search,
  X,
} from "lucide-react";
import gsap from "gsap";

import { cn } from "@/lib/utils";
import { duration, easeOutta } from "@/lib/motion";
import { showWorkSection, siteConfig, type NavItem } from "@/config/site";
import { getAllPackages } from "@/lib/packages";
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
                    {product.dayRate > 0 ? (
                      <span className="text-small font-mono whitespace-nowrap">
                        {formatPrice(product.dayRate, product.currency)}/day
                      </span>
                    ) : null}
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

// The real equipment taxonomy (all 10 real categories, every one reachable)
// collapsed into the client's requested tab set — Camera and Light each
// group a few closely related real categories under one tab. Rendered as
// flat, always-visible tabs in the main nav row (711rent-style), not
// hidden behind a single "Equipment" trigger.
interface EquipmentTabColumn {
  heading: string;
  items: NavItem[];
}

interface EquipmentTab extends NavItem {
  children?: EquipmentTabColumn[];
}

const equipmentTabs: EquipmentTab[] = [
  {
    label: "Camera",
    href: "/equipment/cameras",
    children: [
      {
        heading: "Camera",
        items: [{ label: "Body", href: "/equipment/cameras" }],
      },
      {
        heading: "Monitoring & Control",
        items: [
          { label: "Monitoring", href: "/equipment/monitors" },
          { label: "Lens Control", href: "/equipment/camera-accessories" },
          { label: "Wireless Video", href: "/equipment/camera-accessories" },
        ],
      },
      {
        heading: "Accessories",
        items: [
          { label: "Matte Box", href: "/equipment/matte-boxes" },
          { label: "Filters", href: "/equipment/filters" },
        ],
      },
    ],
  },
  { label: "Lens", href: "/equipment/lenses" },
  {
    label: "Light",
    href: "/equipment/lighting",
    children: [
      {
        heading: "Light",
        items: [
          { label: "Lighting", href: "/equipment/lighting" },
          { label: "Modifiers", href: "/equipment/lighting-modifiers" },
        ],
      },
    ],
  },
  { label: "Grip", href: "/equipment/grip" },
  { label: "Audio", href: "/equipment/audio" },
  {
    label: "Packages",
    href: "/packages",
    children: [
      {
        heading: "Packages",
        items: getAllPackages().map((pkg) => ({ label: pkg.name, href: `/packages/${pkg.slug}` })),
      },
    ],
  },
];

// Thin utility row up top, now a radial FAB instead of a plain link list —
// mirrors 711rent's Home/Rent/Contact/Service/News row in what it links to,
// fanned out from a single button instead. Row 2 (logo + category tabs)
// below is untouched.
const fabItems: (NavItem & { icon: React.ComponentType<{ className?: string; strokeWidth?: number }> })[] = [
  { label: "Services", href: "/services", icon: Briefcase },
  ...(showWorkSection ? [{ label: "Work", href: "/work", icon: Clapperboard }] : []),
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
    heading: "OUTTA RENTALS — ENQUIRY",
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
    // Hidden on mobile — the Request Consultation button is the one
    // floating action there instead (see ConsultationPopup); this FAB's
    // menu (About/Contact/WhatsApp) is still reachable via the mobile tab
    // bar and nav. Desktop keeps it.
    <div ref={containerRef} className="fixed right-4 bottom-24 z-40 hidden lg:right-6 lg:bottom-6 lg:block">
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
  ...(showWorkSection
    ? [
        {
          title: "Explore",
          items: [
            { label: "Productions", href: "/work" },
            { label: "Shot With This Gear", href: "/work" },
          ],
        },
      ]
    : []),
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

  return (
    <header data-slot="navbar" className="sticky top-0 z-40 w-full">
      {/* Floating FAB — fixed to the viewport, detached from the header
          entirely (not stacked in a bar on top of the tabs below). */}
      <NavFab />

      {/* Flat, full-bleed dark bar (711rent-style) — spans the full
          viewport width, no rounded corners/shadow/inset. An inner
          Container just aligns the logo/links/icons row with the rest of
          the page's content width. */}
      <nav
        className={cn(
          "w-full bg-brand transition-shadow",
          scrolled ? "shadow-lg" : ""
        )}
        style={{ transitionDuration: `${duration.fast * 1000}ms` }}
      >
        <Container>
          <div className="flex h-14 items-center justify-between gap-6 sm:h-16">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center rounded-lg bg-white px-3 py-1.5 sm:px-4 sm:py-2"
            >
              <Image
                src="/brand/outta-logo.png"
                alt={siteConfig.name}
                width={595}
                height={225}
                priority
                className="h-8 w-auto sm:h-9"
              />
            </Link>

            <ul className="hidden h-full items-stretch gap-6 lg:flex">
              {equipmentTabs.map((tab) => (
                <React.Fragment key={tab.href}>
                  {tab.label === "Packages" ? (
                    <li aria-hidden className="h-4 w-px self-center bg-white/25" />
                  ) : null}
                  <li className="group/tab relative flex h-full items-center">
                    <Link
                      href={tab.href}
                      className="text-label relative flex items-center gap-1 !text-white/80 whitespace-nowrap transition-colors hover:!text-white"
                    >
                      {tab.label}
                      {tab.children ? (
                        <ChevronDown className="size-3" strokeWidth={2.5} aria-hidden />
                      ) : null}
                    </Link>

                    {tab.children ? (
                      <div className="pointer-events-none fixed inset-x-0 top-14 z-50 translate-y-1 opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-outta)] group-hover/tab:pointer-events-auto group-hover/tab:translate-y-0 group-hover/tab:opacity-100 sm:top-16">
                        <div className="relative w-full overflow-hidden bg-background">
                          <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-brand" />
                          <Container>
                            <div className="flex gap-16 py-8">
                              {tab.children.map((column, ci) => (
                                <div key={column.heading} className="flex min-w-[11rem] flex-col gap-4">
                                  <p className="text-xs font-bold tracking-wider text-foreground/50 uppercase">
                                    {column.heading}
                                  </p>
                                  {column.items.map((child, i) => (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      style={{ transitionDelay: `${(ci * 3 + i) * 30}ms` }}
                                      className="translate-y-1 text-sm whitespace-nowrap text-foreground/70 opacity-0 transition-[opacity,color,transform] duration-200 ease-[var(--ease-outta)] group-hover/tab:translate-y-0 group-hover/tab:opacity-100 hover:text-brand"
                                    >
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </Container>
                        </div>
                      </div>
                    ) : null}
                  </li>
                </React.Fragment>
              ))}
            </ul>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Search />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                // On /kit itself the full cart is already on the page —
                // opening the drawer on top of it just duplicates it,
                // "Clear cart" and all. Only open the drawer elsewhere.
                onClick={() => {
                  if (pathname !== "/kit") openDrawer();
                }}
                className="relative text-white hover:bg-white/10 hover:text-white"
              >
                <ShoppingCart />
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
          </div>
        </Container>
      </nav>

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
                  <ShoppingCart /> Cart
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

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Package, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { duration, easeOutta } from "@/lib/motion";
import { primaryNav, siteConfig, type NavItem } from "@/config/site";
import { availabilityLabels, availabilityVariant } from "@/lib/catalogue";
import { searchCatalogueAction, type CatalogueSearchResult } from "@/lib/catalogue/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { useMobileNav } from "@/components/layout/mobile-nav-provider";
import { useKit } from "@/components/kit/kit-provider";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
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

// Mobile-only grouping of the nav — desktop keeps the flat `primaryNav` list
// (rendered separately below) untouched. Grouped headers give the mobile
// panel MCB-style scannability without changing what routes exist.
const mobileNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Equipment",
    items: [
      { label: "All Equipment", href: "/equipment" },
      { label: "Cameras", href: "/equipment/cameras" },
      { label: "Lenses", href: "/equipment/lenses" },
      { label: "Lighting", href: "/equipment/lighting" },
      { label: "Grip", href: "/equipment/grip" },
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

  return (
    <header
      data-slot="navbar"
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background transition-shadow",
        scrolled ? "shadow-sm" : ""
      )}
      style={{ transitionDuration: `${duration.fast * 1000}ms` }}
    >
      <Container>
        <nav className="flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/brand/outta-logo.png"
              alt={siteConfig.name}
              width={595}
              height={225}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group/link text-label relative text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand transition-all duration-200 ease-out group-hover/link:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <WhatsAppButton
              label="WhatsApp Us"
              variant="default"
              size="sm"
              closingLine="I'd like to talk about an upcoming shoot."
              className="hidden lg:inline-flex"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Search />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Kit list"
              onClick={openDrawer}
              className="relative hidden sm:inline-flex"
            >
              <Package />
              {hydrated && itemCount > 0 ? (
                <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full border border-background bg-brand text-[0.5625rem] font-medium text-brand-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Button>
            {/* No mobile hamburger here — the mobile tab bar's Menu tab opens
                the same panel, so a second control in the header would be
                redundant. */}
          </div>
        </nav>
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

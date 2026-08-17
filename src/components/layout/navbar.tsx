"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, LoaderCircle, Menu, Package, Search, SlidersHorizontal, X } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { siteConfig, type NavItem } from "@/config/site";
import {
  availabilityLabels,
  availabilityVariant,
  categories,
  getCategoryIcon,
} from "@/lib/catalogue";
import { searchCatalogueAction, type CatalogueSearchResult } from "@/lib/catalogue/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { useMobileNav } from "@/components/layout/mobile-nav-provider";
import { useKit } from "@/components/kit/kit-provider";
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

// The real equipment taxonomy (all 12 real categories, every one reachable),
// grouped the same way as before — now surfaced through the "Menu" drawer
// (see below) rather than an always-visible tab row, since the client wants
// a minimal floating pill nav instead.
const equipmentTabs: NavItem[] = [
  { label: "Camera", href: "/equipment/cameras" },
  { label: "Lens", href: "/equipment/lenses" },
  { label: "Light", href: "/equipment/lighting" },
  { label: "Grip", href: "/equipment/grip" },
  { label: "Accessories", href: "/equipment/accessories" },
  { label: "Audio", href: "/equipment/audio" },
  { label: "Drone", href: "/equipment/drones" },
];

// Grouped nav for the "Menu" drawer — opened from the pill on every
// breakpoint now, not just mobile.
const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Equipment",
    items: [{ label: "All Equipment", href: "/equipment" }, ...equipmentTabs],
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

function Navbar() {
  const { open: mobileOpen, setOpen: setMobileOpen } = useMobileNav();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const { itemCount, openDrawer, hydrated } = useKit();

  return (
    <header data-slot="navbar" className="sticky top-0 z-40 w-full bg-background py-3 sm:py-4">
      <Container>
        <div className="flex items-center justify-center gap-2">
          {/* Floating pill nav — Menu (opens the full drawer) + Equipment on
              the left, the brand mark centered, About + Contact on the
              right. Deliberately minimal; category browsing lives in the
              drawer instead of an always-visible tab row. */}
          <nav className="border-border flex w-full max-w-2xl items-center justify-between rounded-full border bg-background py-2 pr-2 pl-5 shadow-lg sm:pl-6">
            <div className="flex items-center gap-5 sm:gap-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="text-label flex items-center gap-1.5 whitespace-nowrap text-foreground transition-colors hover:text-brand"
              >
                <Menu className="size-3.5" strokeWidth={2} aria-hidden />
                Menu
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="text-label hidden items-center gap-1.5 whitespace-nowrap text-foreground transition-colors hover:text-brand sm:flex"
              >
                <SlidersHorizontal className="size-3.5" strokeWidth={2} aria-hidden />
                Filter
              </button>
            </div>

            <Link href="/" aria-label={siteConfig.name} className="shrink-0">
              <span className="flex size-11 items-center justify-center rounded-full bg-brand text-brand-foreground sm:size-12">
                <Camera className="size-5" strokeWidth={1.75} />
              </span>
            </Link>

            <div className="flex items-center gap-5 sm:gap-8">
              <Link
                href="/about"
                className="text-label hidden whitespace-nowrap text-foreground transition-colors hover:text-brand sm:inline"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-label whitespace-nowrap text-foreground transition-colors hover:text-brand"
              >
                Contact
              </Link>
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Kit list" onClick={openDrawer} className="relative">
              <Package />
              {hydrated && itemCount > 0 ? (
                <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full border border-background bg-brand text-[0.5625rem] font-medium text-brand-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Button>
          </div>
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

      <Modal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter by category"
        description="Jump straight into any category's real inventory."
        className="sm:max-w-lg"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <Link
                key={category.slug}
                href={`/equipment/${category.slug}`}
                onClick={() => setFilterOpen(false)}
                className="border-border flex flex-col items-center gap-2 border p-4 text-center transition-colors hover:border-brand hover:text-brand"
              >
                <Icon className="size-5" strokeWidth={1.75} />
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </Modal>

      {/* Full nav drawer — opened from the pill's "Menu" trigger, on every
          breakpoint. */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast, ease: easeOutta }}
            className="fixed inset-0 z-50 bg-background"
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
              <nav className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-3">
                {navGroups.map((group, gi) => (
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

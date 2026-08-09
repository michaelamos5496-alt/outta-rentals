"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Menu, Package, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { duration, easeOutta } from "@/lib/motion";
import { primaryNav } from "@/config/site";
import { availabilityLabels, availabilityVariant } from "@/lib/catalogue";
import { searchCatalogueAction, type CatalogueSearchResult } from "@/lib/catalogue/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { useKit } from "@/components/kit/kit-provider";

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
                    <span className="text-small whitespace-nowrap">
                      ${product.dayRate}/day
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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { itemCount, openDrawer, hydrated } = useKit();

  return (
    <header
      data-slot="navbar"
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
      style={{ transitionDuration: `${duration.fast * 1000}ms` }}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between sm:h-20">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-[-0.01em]"
          >
            OUTTA
            <span className="text-brand">.</span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group/link text-label relative text-foreground/70 transition-colors hover:text-foreground"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand transition-all duration-200 ease-out group-hover/link:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
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
                <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-brand text-[0.5625rem] font-medium text-brand-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
            >
              <Menu />
            </Button>
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
            <Container>
              <div className="flex h-16 items-center justify-between sm:h-20">
                <span className="font-heading text-lg font-semibold">
                  OUTTA<span className="text-brand">.</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <ul className="mt-8 flex flex-col gap-1">
                {primaryNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: duration.base,
                      delay: i * 0.05,
                      ease: easeOutta,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-h3 block py-3"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
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
                    <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-brand text-[0.6875rem] font-medium text-brand-foreground">
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

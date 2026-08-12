"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import {
  brands,
  categories,
  getCategoryBySlug,
  getCategoryIcon,
  getPriceBounds,
  searchProducts,
  type DemoProduct,
} from "@/lib/catalogue";
import { Heading } from "@/components/ui/heading";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingGrid } from "@/components/ui/state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ProductCard } from "@/components/catalogue/product-card";
import { FilterPanel, type CatalogueFilters } from "@/components/catalogue/filter-panel";

type SortKey = "featured" | "name-asc" | "price-asc" | "price-desc";

const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  "name-asc": "Name (A–Z)",
  "price-asc": "Price (Low to High)",
  "price-desc": "Price (High to Low)",
};

function sortProducts(list: DemoProduct[], sort: SortKey): DemoProduct[] {
  const copy = [...list];
  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return copy.sort((a, b) => a.dayRate - b.dayRate);
    case "price-desc":
      return copy.sort((a, b) => b.dayRate - a.dayRate);
    default:
      return copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

const PAGE_SIZE = 9;

export interface CatalogueViewProps {
  /** Already fetched server-side (database when connected, demo data otherwise) — see `src/lib/catalogue/db.ts`. */
  products: DemoProduct[];
  lockedCategory?: string;
}

function CatalogueView({ products, lockedCategory }: CatalogueViewProps) {
  const categoryPool = products;
  const priceBounds = React.useMemo(() => getPriceBounds(categoryPool), [categoryPool]);

  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const isPending = query !== debouncedQuery;

  const [filters, setFilters] = React.useState<CatalogueFilters>({
    categories: [],
    brands: [],
    availability: [],
    priceRange: priceBounds,
  });

  // Only offer brands that actually have equipment in the selected category —
  // otherwise the brand list stays global even when a category is checked.
  const brandOptions = React.useMemo(() => {
    const activeCategories = lockedCategory ? [lockedCategory] : filters.categories;
    const pool =
      activeCategories.length > 0
        ? categoryPool.filter((p) => activeCategories.includes(p.categorySlug))
        : categoryPool;
    const slugsInPool = new Set(pool.map((p) => p.brandSlug));
    return brands.filter((b) => slugsInPool.has(b.slug));
  }, [categoryPool, lockedCategory, filters.categories]);

  // Drop any selected brand that's no longer offered once the category
  // selection narrows the list — adjusting during render (rather than an
  // effect) avoids an extra commit, same pattern as resetKey below.
  const validBrandSlugs = React.useMemo(
    () => new Set(brandOptions.map((b) => b.slug)),
    [brandOptions]
  );
  if (filters.brands.some((slug) => !validBrandSlugs.has(slug))) {
    setFilters((f) => ({ ...f, brands: f.brands.filter((slug) => validBrandSlugs.has(slug)) }));
  }
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  // Reset pagination whenever the active query/filters/sort change. Adjusting
  // state during render (rather than in an effect) avoids an extra render pass.
  const resetKey = React.useMemo(
    () => JSON.stringify({ debouncedQuery, filters, sort, lockedCategory }),
    [debouncedQuery, filters, sort, lockedCategory]
  );
  const [prevResetKey, setPrevResetKey] = React.useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setVisibleCount(PAGE_SIZE);
  }

  const filtered = React.useMemo(() => {
    let list = categoryPool;
    if (!lockedCategory && filters.categories.length > 0) {
      list = list.filter((p) => filters.categories.includes(p.categorySlug));
    }
    list = searchProducts(debouncedQuery, list);
    if (filters.brands.length > 0) {
      list = list.filter((p) => filters.brands.includes(p.brandSlug));
    }
    if (filters.availability.length > 0) {
      list = list.filter((p) => filters.availability.includes(p.availability));
    }
    list = list.filter(
      (p) => p.dayRate >= filters.priceRange[0] && p.dayRate <= filters.priceRange[1]
    );
    return list;
  }, [categoryPool, lockedCategory, filters, debouncedQuery]);

  const sorted = React.useMemo(() => sortProducts(filtered, sort), [filtered, sort]);
  const visible = sorted.slice(0, visibleCount);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.availability.length > 0 ||
    filters.priceRange[0] !== priceBounds[0] ||
    filters.priceRange[1] !== priceBounds[1] ||
    query.length > 0;

  const clearAll = React.useCallback(() => {
    setQuery("");
    setFilters({ categories: [], brands: [], availability: [], priceRange: priceBounds });
  }, [priceBounds]);

  const category = lockedCategory ? getCategoryBySlug(lockedCategory) : undefined;
  const suggestedCategories = categories.filter((c) => c.slug !== lockedCategory).slice(0, 4);

  return (
    <Container className="py-10 sm:py-14">
      {lockedCategory ? (
        <p className="text-small mb-3">
          <Link href="/equipment" className="hover:text-foreground">
            Equipment
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">{category?.name ?? lockedCategory}</span>
        </p>
      ) : null}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <Heading level="h1" eyebrow="Equipment">
          {category ? category.name : "All Equipment"}
        </Heading>
        <p className="text-small max-w-sm">
          {category?.description ??
            "Demo equipment for illustration — not confirmed OUTTA inventory."}
        </p>
      </div>

      {!lockedCategory ? (
        <div className="scrollbar-none -mx-4 mt-6 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, categories: [] }))}
            className={cn(
              "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 transition-colors",
              filters.categories.length === 0
                ? "bg-brand-muted text-brand"
                : "text-foreground/70"
            )}
          >
            <LayoutGrid className="size-4" strokeWidth={1.75} />
            <span className="text-[0.5625rem] font-semibold tracking-wide uppercase">All</span>
          </button>
          {categories.map((c) => {
            const active = filters.categories.includes(c.slug);
            const Icon = getCategoryIcon(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    categories: active ? [] : [c.slug],
                  }))
                }
                className={cn(
                  "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors",
                  active ? "bg-brand-muted text-brand" : "text-foreground/70"
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                <span className="text-[0.5625rem] font-semibold tracking-wide uppercase">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-8">
        <SearchInput
          containerClassName="flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand, category…"
        />
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="hidden lg:flex lg:w-52">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {sortLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="hidden items-center gap-1 rounded-lg border border-input p-1 sm:flex">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <LayoutGrid />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="List view"
              onClick={() => setView("list")}
            >
              <List />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="size-3.5" /> Filters
            {hasActiveFilters ? (
              <Badge variant="brand" className="ml-1">
                {filters.categories.length +
                  filters.brands.length +
                  filters.availability.length}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel
              filters={filters}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
              onClear={clearAll}
              showCategoryFilter={!lockedCategory}
              brandOptions={brandOptions}
              priceBounds={priceBounds}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </aside>

        <div>
          {isPending ? (
            <LoadingGrid count={6} />
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No equipment found."
              description="Try a different search term or clear your filters."
              action={
                <div className="flex flex-col items-center gap-6">
                  <Button variant="outline" onClick={clearAll}>
                    Clear filters
                  </Button>
                  {suggestedCategories.length > 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-label">Browse instead</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestedCategories.map((c) => (
                          <Button key={c.slug} asChild variant="secondary" size="sm">
                            <Link href={`/equipment/${c.slug}`}>{c.name}</Link>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              }
            />
          ) : (
            <>
              <p className="text-small mb-6">
                Showing {visible.length} of {sorted.length}
              </p>
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-x-4 sm:gap-y-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-8"
                }
              >
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} view={view} />
                ))}
              </div>
              {visibleCount < sorted.length ? (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Load more
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DrawerContent side="right" className="overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="mb-6">
              <p className="text-label mb-2">Sort by</p>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {sortLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FilterPanel
              filters={filters}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
              onClear={clearAll}
              showCategoryFilter={!lockedCategory}
              brandOptions={brandOptions}
              priceBounds={priceBounds}
              hasActiveFilters={hasActiveFilters}
            />
            <Button className="mt-8 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Show {sorted.length} results
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </Container>
  );
}

export { CatalogueView };

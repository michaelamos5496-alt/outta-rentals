"use client";

import * as React from "react";
import { Check, Plus, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import {
  availabilityLabels,
  availabilityVariant,
  getBrandBySlug,
  getCategoryBySlug,
  type DemoProduct,
} from "@/lib/catalogue";
import { useKit } from "@/components/kit/kit-provider";
import { useQuickView } from "@/components/catalogue/quick-view-provider";
import { getProductGallery, getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";
import { useElasticHoverScale } from "@/lib/elastic-hover";

export interface ProductCardProps {
  product: DemoProduct;
  view?: "grid" | "list";
  /** Much smaller card for secondary shelves: name, photo, price and a small Add button only. */
  compact?: boolean;
  className?: string;
}

/** The admin-uploaded cover photo when there is one, else the editorial stock fallback. */
function primaryImage(product: DemoProduct): string | undefined {
  return product.images?.[0]?.url ?? getProductImage(product.slug);
}

/** A second photo to reveal on hover, when the product has one. */
function secondaryImage(product: DemoProduct): string | undefined {
  return product.images?.[1]?.url ?? getProductGallery(product.slug)[1];
}

function ProductCard({ product, view = "grid", compact = false, className }: ProductCardProps) {
  const { addItem, items, openDrawer } = useKit();
  const { open: openQuickView } = useQuickView();
  // Stays "In Cart" for as long as the item is in the cart, so it can't be added twice by accident.
  const added = items.some((i) => i.productSlug === product.slug);
  const cartButtonRef = React.useRef<HTMLButtonElement>(null);
  const cartHover = useElasticHoverScale(cartButtonRef, 1.14);
  // Nothing to rent yet — no quick-add, just a flag so people don't expect
  // to book it today.
  const isAvailable = product.availability === "available";

  if (view === "list") {
    return <ListProductCard product={product} className={className} />;
  }

  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const category = getCategoryBySlug(product.categorySlug)?.name;
  const symbol = product.currency === "USD" ? "$" : "\u20b5";
  const pill =
    "inline-flex items-center rounded-full border border-white/35 px-2.5 py-1 text-[10px] font-medium tracking-wide whitespace-nowrap text-white/90 uppercase sm:px-3 sm:text-[11px]";

  // Dark spec-sheet card: name + tag pills on top, the photo under a soft
  // studio spotlight, a big day rate, and a pill row at the bottom. Clicking
  // the card opens the quick-view popup (see quick-view-provider.tsx) instead
  // of navigating to a full product page.
  return (
    <article
      className={cn(
        "group/product relative flex flex-col overflow-hidden bg-brand text-brand-foreground ring-1 ring-black/10 transition-shadow duration-300 hover:ring-white/70",
        compact ? "rounded-2xl" : "rounded-3xl",
        className
      )}
    >
      <button
        type="button"
        onClick={() => openQuickView(product)}
        aria-label={`View ${product.name}`}
        className={cn(
          "flex flex-1 flex-col text-left active:opacity-80",
          compact ? "p-2 pb-1.5" : "p-3 pb-2 sm:p-4 sm:pb-2.5"
        )}
      >
        <p
          className={cn(
            "line-clamp-2 min-h-[2.2em] font-semibold",
            compact ? "text-xs/[1.1]" : "text-base/[1.1] sm:text-lg/[1.1]"
          )}
        >
          {product.name}
        </p>

        {compact ? null : (
          <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2">
            <span className={pill}>{brand}</span>
            {category ? <span className={cn(pill, "hidden sm:inline-flex")}>{category}</span> : null}
          </div>
        )}

        {/* Studio spotlight behind the photo. The photos sit on white, so they
            multiply into the light backdrop and read as cutouts. */}
        <div className="relative mt-1.5 aspect-[4/3] w-full overflow-hidden rounded-xl sm:mt-2 sm:rounded-2xl bg-[radial-gradient(ellipse_at_50%_35%,#ffffff_0%,#e4e7ea_55%,#b9bec4_100%)] sm:mt-4">
          <MediaPlaceholder
            src={primaryImage(product)}
            alt={product.name}
            fit="contain"
            className="absolute inset-0 h-full w-full !bg-transparent mix-blend-multiply"
          />
          {/* On hover, crossfade to a second photo. It sits on its own opaque
              copy of the backdrop so the two photos never show through each
              other mid-fade. */}
          {secondaryImage(product) ? (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#ffffff_0%,#e4e7ea_55%,#b9bec4_100%)] opacity-0 transition-opacity duration-500 ease-[var(--ease-outta)] group-hover/product:opacity-100">
              <MediaPlaceholder
                src={secondaryImage(product)}
                alt={product.name}
                fit="contain"
                className="absolute inset-0 h-full w-full !bg-transparent mix-blend-multiply"
              />
            </div>
          ) : null}
        </div>

        {product.dayRate > 0 ? (
          <p className={cn("flex items-baseline gap-1", compact ? "mt-1.5" : "mt-2.5 gap-1.5")}>
            <span className={cn("leading-none font-semibold tracking-tight", compact ? "text-base" : "text-3xl")}>
              {product.dayRate.toLocaleString()}
            </span>
            <span className={cn("font-medium text-white/70", compact ? "text-[10px]" : "text-sm")}>
              {symbol} /DAY
            </span>
          </p>
        ) : null}
      </button>

      <div className={cn("flex items-center gap-2", compact ? "px-2 pb-2" : "px-3 pb-3 sm:px-4 sm:pb-4")}>
        <span className={cn(pill, "gap-1.5", compact && "hidden")}>
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", isAvailable ? "bg-white" : "bg-white/50")}
          />
          {availabilityLabels[product.availability]}
        </span>

        {/* The "+" badge makes it read as add-to-cart; it turns into a check
            once the item is in the cart. Nothing to quick-add for a
            not-yet-available product. */}
        {isAvailable ? (
          <button
            ref={cartButtonRef}
            type="button"
            aria-label={added ? "In cart — view cart" : `Add ${product.name} to cart`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (added) openDrawer();
              else addItem(product.slug);
            }}
            onMouseEnter={cartHover.onMouseEnter}
            onMouseLeave={cartHover.onMouseLeave}
            className={cn(
              "ml-auto inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide uppercase transition-colors active:scale-95",
              compact ? "h-6 w-full justify-center px-2 text-[10px]" : "h-8 px-3 text-[11px] sm:h-9 sm:px-4",
              added
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-white text-brand hover:bg-white/90"
            )}
          >
            {added ? <Check className="size-3.5" strokeWidth={2.5} /> : <ShoppingCart className="size-3.5" strokeWidth={2} />}
            {added ? "In cart" : "Add"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function ListProductCard({
  product,
  className,
}: {
  product: DemoProduct;
  className?: string;
}) {
  const { addItem, items, openDrawer } = useKit();
  const { open: openQuickView } = useQuickView();
  // Stays "In Cart" for as long as the item is in the cart, so it can't be added twice by accident.
  const added = items.some((i) => i.productSlug === product.slug);
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;

  return (
    <article className={cn("group/product flex flex-row gap-5", className)}>
      <button
        type="button"
        onClick={() => openQuickView(product)}
        aria-label={`View ${product.name}`}
        className="block w-32 shrink-0 overflow-hidden border border-border sm:w-48"
      >
        <MediaPlaceholder
          src={primaryImage(product)}
          alt={product.name}
          meta={product.sku}
          fit="contain"
          className="aspect-square h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
        />
      </button>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label text-muted-foreground">{brand}</p>
            <button type="button" onClick={() => openQuickView(product)} className="text-left">
              <h3 className="mt-1 font-medium leading-snug hover:text-brand">{product.name}</h3>
            </button>
          </div>
          <Badge variant={availabilityVariant[product.availability]} className="shrink-0">
            {availabilityLabels[product.availability]}
          </Badge>
        </div>
        <p className="text-small mt-2 line-clamp-2">{product.shortDescription}</p>
        {product.dayRate > 0 ? (
          <p className="mt-2 font-mono text-sm font-semibold">
            {formatPrice(product.dayRate, product.currency)}
            <span className="font-sans font-normal text-muted-foreground"> / day</span>
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-end gap-3 pt-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => openQuickView(product)}>
              View Details
            </Button>
            <Button
              variant={added ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                if (added) openDrawer();
                else addItem(product.slug);
              }}
            >
              {added ? <Check /> : <Plus />}
              {added ? "In Cart" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export { ProductCard };

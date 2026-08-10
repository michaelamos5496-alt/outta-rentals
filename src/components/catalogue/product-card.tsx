"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import {
  availabilityLabels,
  availabilityVariant,
  getBrandBySlug,
  getCategoryBySlug,
  getCategoryIcon,
  type DemoProduct,
} from "@/lib/catalogue";
import { useKit } from "@/components/kit/kit-provider";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";

export interface ProductCardProps {
  product: DemoProduct;
  view?: "grid" | "list";
  className?: string;
}

function ProductCard({ product, view = "grid", className }: ProductCardProps) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const category = getCategoryBySlug(product.categorySlug);
  const icon = getCategoryIcon(product.categorySlug);
  const href = `/equipment/${product.slug}`;

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  if (view === "grid") {
    return (
      <>
        {/* Mobile card — category badge over image, dark name plate, price/Rent
            bar (MCB-style anatomy), reskinned in OUTTA's dark + brand-green
            language. Desktop keeps the original card below, unchanged. */}
        <article className={cn("sm:hidden", className)}>
          <Link
            href={href}
            className="block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative">
              <MediaPlaceholder
                src={getProductImage(product.slug, product.categorySlug)}
                alt={product.name}
                icon={icon}
                className="aspect-square w-full"
              />
              {category ? (
                <span className="text-meta absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-1 text-foreground/80 backdrop-blur-sm">
                  {category.name}
                </span>
              ) : null}
            </div>
            <div className="border-t border-border px-3 py-2.5">
              <p className="text-label truncate text-muted-foreground">{brand}</p>
              <p className="mt-0.5 truncate text-sm font-medium">{product.name}</p>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
              <p className="text-sm">
                <span className="font-medium">{formatPrice(product.dayRate)}</span>
                <span className="text-muted-foreground">/day</span>
              </p>
              <button
                type="button"
                aria-label={added ? "Added to kit" : "Add to kit"}
                onClick={(e) => {
                  e.preventDefault();
                  addItem(product.slug);
                  setAdded(true);
                }}
                className={cn(
                  "text-label rounded-full px-3 py-1.5 transition-colors",
                  added
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-brand text-brand-foreground"
                )}
              >
                {added ? "Added" : "Rent"}
              </button>
            </div>
          </Link>
        </article>

        <DesktopProductCard
          product={product}
          view={view}
          className={cn("hidden sm:flex", className)}
        />
      </>
    );
  }

  return <DesktopProductCard product={product} view={view} className={className} />;
}

function DesktopProductCard({ product, view = "grid", className }: ProductCardProps) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const icon = getCategoryIcon(product.categorySlug);
  const href = `/equipment/${product.slug}`;

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  return (
    <article
      className={cn(
        "group/product flex",
        view === "list" ? "flex-row gap-5" : "flex-col",
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          "block shrink-0 overflow-hidden rounded-xl",
          view === "list" ? "w-32 sm:w-48" : "w-full"
        )}
      >
        <MediaPlaceholder
          src={getProductImage(product.slug, product.categorySlug)}
          alt={product.name}
          icon={icon}
          meta={product.sku}
          className={cn(
            "w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105",
            view === "list" ? "aspect-square h-full" : "aspect-4/3"
          )}
        />
      </Link>

      <div className={cn("flex flex-1 flex-col", view === "grid" && "mt-4")}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label text-muted-foreground">{brand}</p>
            <Link href={href}>
              <h3 className="mt-1 font-medium leading-snug hover:text-brand">
                {product.name}
              </h3>
            </Link>
          </div>
          <Badge
            variant={availabilityVariant[product.availability]}
            className="hidden shrink-0 sm:inline-flex"
          >
            {availabilityLabels[product.availability]}
          </Badge>
        </div>
        <p className="text-small mt-2 hidden line-clamp-2 sm:block">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-sm">
            <span className="font-medium">{formatPrice(product.dayRate)}</span>
            <span className="text-muted-foreground"> / day</span>
          </p>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href={href}>View Details</Link>
            </Button>
            <Button
              variant={added ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                addItem(product.slug);
                setAdded(true);
              }}
            >
              {added ? <Check /> : <Plus />}
              {added ? "Added" : "Add to Kit"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export { ProductCard };

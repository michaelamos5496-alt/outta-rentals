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
  const { addItem, items, openDrawer } = useKit();
  // Stays "In Cart" for as long as the item is in the cart, so it can't be added twice by accident.
  const added = items.some((i) => i.productSlug === product.slug);
  const href = `/equipment/${product.slug}`;
  const brand = getBrandBySlug(product.brandSlug);
  const category = getCategoryBySlug(product.categorySlug);


  if (view === "list") {
    return <ListProductCard product={product} className={className} />;
  }

  // Green card sitewide: brand + category + description on the green fill,
  // large photo, circular quick-add button.
  return (
    <article className={cn("group/product relative overflow-hidden rounded-2xl bg-brand", className)}>
      <Link href={href} className="block active:opacity-80">
        <div className="flex items-start justify-between gap-2 p-3 pb-1.5 sm:p-3.5 sm:pb-1.5">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-brand-foreground">
              {product.name}
            </p>
            <p className="mt-1 text-[0.6875rem] text-brand-foreground/70">
              {brand?.name ?? product.brandSlug}
              {category ? ` · ${category.name}` : ""}
            </p>
            {product.dayRate > 0 ? (
              <p className="mt-1.5 font-mono text-sm leading-none font-bold text-brand-foreground">
                {formatPrice(product.dayRate, product.currency)}/day
              </p>
            ) : null}
          </div>
          <p className="hidden max-w-[40%] text-right text-[0.625rem] leading-snug text-brand-foreground/70 sm:line-clamp-2 sm:block">
            {product.shortDescription}
          </p>
        </div>

        <div className="relative mt-1">
          <MediaPlaceholder
            src={getProductImage(product.slug, product.categorySlug)}
            alt={product.name}
            className="aspect-[16/11] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
          />
        </div>
      </Link>

      <button
        type="button"
        aria-label={added ? "In cart — view cart" : `Add ${product.name} to cart`}
        onClick={(e) => {
          e.preventDefault();
          if (added) openDrawer();
          else addItem(product.slug);
        }}
        className={cn(
          "absolute bottom-2 left-2 flex h-9 items-center gap-1 rounded-full pr-3.5 pl-2.5 text-xs font-bold transition-colors active:scale-95",
          added ? "bg-brand-foreground text-brand" : "bg-foreground text-background"
        )}
      >
        {added ? <Check className="size-4" /> : <Plus className="size-4" />}
        {added ? "In Cart" : "Add to Cart"}
      </button>
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
  // Stays "In Cart" for as long as the item is in the cart, so it can't be added twice by accident.
  const added = items.some((i) => i.productSlug === product.slug);
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const icon = getCategoryIcon(product.categorySlug);
  const href = `/equipment/${product.slug}`;


  return (
    <article className={cn("group/product flex flex-row gap-5", className)}>
      <Link href={href} className="block w-32 shrink-0 overflow-hidden border border-border sm:w-48">
        <MediaPlaceholder
          src={getProductImage(product.slug, product.categorySlug)}
          alt={product.name}
          icon={icon}
          meta={product.sku}
          className="aspect-square h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label text-muted-foreground">{brand}</p>
            <Link href={href}>
              <h3 className="mt-1 font-medium leading-snug hover:text-brand">{product.name}</h3>
            </Link>
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
            <Button asChild variant="ghost" size="sm">
              <Link href={href}>View Details</Link>
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

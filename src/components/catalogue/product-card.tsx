"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";

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
import { getProductImage, isolatedProductPhotos } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";

export interface ProductCardProps {
  product: DemoProduct;
  view?: "grid" | "list";
  className?: string;
}

function ProductCard({ product, view = "grid", className }: ProductCardProps) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const href = `/equipment/${product.slug}`;
  const brand = getBrandBySlug(product.brandSlug);
  const category = getCategoryBySlug(product.categorySlug);
  const isolated = isolatedProductPhotos.has(product.slug);

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  if (view === "list") {
    return <ListProductCard product={product} className={className} />;
  }

  // Same rounded "product tile" sitewide: green card (brand + category +
  // description), large photo, price tag, circular quick-add button.
  // Products with real isolated photography (a genuine transparent-
  // background cutout, not a flat white fill) render straight onto this
  // same green — no white box, the cutout composites directly onto the
  // card.
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
          </div>
          <p className="hidden max-w-[40%] text-right text-[0.625rem] leading-snug text-brand-foreground/70 sm:line-clamp-2 sm:block">
            {product.shortDescription}
          </p>
        </div>

        <div className="relative mt-1">
          <MediaPlaceholder
            src={getProductImage(product.slug, product.categorySlug)}
            alt={product.name}
            fit={isolated ? "contain" : "cover"}
            className="aspect-[16/11] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
          />
          <span className="absolute right-2 bottom-2 bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold">
            {formatPrice(product.dayRate, product.currency)}/day
          </span>
        </div>
      </Link>

      <button
        type="button"
        aria-label={added ? "Added to kit" : "Add to kit"}
        onClick={(e) => {
          e.preventDefault();
          addItem(product.slug);
          setAdded(true);
        }}
        className={cn(
          "absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full transition-colors active:scale-90",
          added ? "bg-brand-foreground text-brand" : "bg-foreground text-background"
        )}
      >
        {added ? <Check className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
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
    <article className={cn("group/product flex flex-row gap-5", className)}>
      <Link href={href} className="block w-32 shrink-0 overflow-hidden border border-border sm:w-48">
        <MediaPlaceholder
          src={getProductImage(product.slug, product.categorySlug)}
          alt={product.name}
          icon={icon}
          meta={product.sku}
          fit={isolatedProductPhotos.has(product.slug) ? "contain" : "cover"}
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

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-sm">
            <span className="font-medium">{formatPrice(product.dayRate, product.currency)}</span>
            <span className="text-muted-foreground"> / day</span>
          </p>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
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

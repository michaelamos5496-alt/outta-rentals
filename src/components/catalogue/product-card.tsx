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
  const href = `/equipment/${product.slug}`;
  const brand = getBrandBySlug(product.brandSlug);
  const category = getCategoryBySlug(product.categorySlug);

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  if (view === "list") {
    return <ListProductCard product={product} className={className} />;
  }

  // Same rounded "product tile" as the homepage Featured Equipment cards —
  // one consistent card look sitewide: green header (brand + category +
  // description), large photo, price tag, circular quick-add button.
  return (
    <article className={cn("group/product relative overflow-hidden rounded-[28px] bg-brand", className)}>
      <Link href={href} className="block active:opacity-80">
        <div className="flex items-start justify-between gap-3 p-4 pb-2 sm:p-5 sm:pb-2">
          <div className="min-w-0">
            <p className="truncate text-base font-bold lowercase leading-none text-brand-foreground sm:text-lg">
              {brand?.name.toLowerCase() ?? product.brandSlug}
            </p>
            {category ? (
              <p className="mt-1.5 text-xs text-brand-foreground/70">{category.name.toLowerCase()}</p>
            ) : null}
          </div>
          <p className="hidden max-w-[45%] text-right text-[0.6875rem] leading-snug text-brand-foreground/70 sm:line-clamp-3 sm:block">
            {product.shortDescription}
          </p>
        </div>

        <div className="relative mt-1">
          <MediaPlaceholder
            src={getProductImage(product.slug, product.categorySlug)}
            alt={product.name}
            className="aspect-[4/3] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
          />
          <span className="absolute right-3 bottom-3 bg-background px-2 py-1 font-mono text-[0.6875rem] font-semibold">
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
          "absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full transition-colors active:scale-90",
          added ? "bg-brand-foreground text-brand" : "bg-foreground text-background"
        )}
      >
        {added ? <Check className="size-4" /> : <ArrowUpRight className="size-4" />}
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

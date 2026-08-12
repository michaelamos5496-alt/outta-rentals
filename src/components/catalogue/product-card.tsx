"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CornerAccent } from "@/components/ui/corner-accent";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import {
  availabilityLabels,
  availabilityVariant,
  getBrandBySlug,
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
  const icon = getCategoryIcon(product.categorySlug);
  const href = `/equipment/${product.slug}`;

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  if (view === "list") {
    return <ListProductCard product={product} className={className} />;
  }

  // Quiet editorial grid card — same anatomy at every breakpoint: image,
  // name, tabular price, one small green accent button. No badge,
  // description, or secondary button.
  return (
    <article className={className}>
      <Link href={href} className="block active:opacity-80">
        <div className="relative overflow-hidden rounded-lg">
          <MediaPlaceholder
            src={getProductImage(product.slug, product.categorySlug)}
            alt={product.name}
            icon={icon}
            className="aspect-4/3 w-full transition-transform duration-500 ease-[var(--ease-outta)]"
          />
          <CornerAccent />
        </div>
        <p className="mt-1.5 truncate text-xs font-medium sm:mt-2 sm:text-sm">{product.name}</p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold tabular-nums sm:text-sm">
            <span className="font-mono">{formatPrice(product.dayRate)}</span>
            <span className="font-sans font-normal text-muted-foreground"> /day</span>
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
              "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors active:scale-90 sm:size-7",
              added ? "bg-secondary text-secondary-foreground" : "bg-brand text-brand-foreground"
            )}
          >
            {added ? <Check className="size-3 sm:size-3.5" /> : <Plus className="size-3 sm:size-3.5" />}
          </button>
        </div>
      </Link>
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
      <Link href={href} className="block w-32 shrink-0 overflow-hidden rounded-xl sm:w-48">
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
            <span className="font-medium">{formatPrice(product.dayRate)}</span>
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

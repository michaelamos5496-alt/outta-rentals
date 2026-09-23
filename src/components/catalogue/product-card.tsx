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

  // The catalogue grid takes its silhouette from a film clapper: a striped
  // hinged slate on top, with the equipment details and image on the board.
  return (
    <article className={cn("group/product relative isolate pt-7", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute top-2 left-[-2%] z-10 h-7 w-[104%] origin-[12%_100%] -rotate-[3deg] overflow-hidden rounded-sm bg-brand shadow-sm transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:-rotate-[10deg] motion-reduce:transition-none"
      >
        <div
          className="absolute inset-0 opacity-95"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--background) 0 16px, transparent 16px 32px)",
          }}
        />
        <span className="absolute bottom-[-5px] left-[12%] size-3 rounded-full border-2 border-brand-foreground bg-brand" />
      </div>

      <div className="relative overflow-hidden rounded-lg bg-brand shadow-sm ring-1 ring-foreground/15">
        <Link href={href} className="block active:opacity-80">
          <div className="flex min-h-[5.5rem] items-start justify-between gap-2 border-b border-brand-foreground/30 px-3 pt-4 pb-3 sm:px-3.5">
            <div className="flex min-w-0 flex-1 flex-col justify-end self-stretch">
              <p className="line-clamp-2 text-sm font-bold leading-tight text-brand-foreground">
                {product.name}
              </p>
              <p className="mt-1 text-[0.6875rem] text-brand-foreground/70">
                {brand?.name ?? product.brandSlug}
                {category ? ` · ${category.name}` : ""}
              </p>
            </div>
            <p className="hidden max-w-[40%] self-end text-right text-[0.625rem] leading-snug text-brand-foreground/70 sm:line-clamp-2 sm:block">
              {product.shortDescription}
            </p>
          </div>

          <div className="relative mx-3 mt-3 mb-3 overflow-hidden rounded-sm ring-1 ring-foreground/20 sm:mx-3.5">
            <MediaPlaceholder
              src={getProductImage(product.slug, product.categorySlug)}
              alt={product.name}
              className="aspect-[16/10] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
            />
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
            added ? "bg-brand text-brand-foreground" : "bg-background text-foreground"
          )}
        >
          {added ? <Check className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
        </button>
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

        <div className="mt-auto flex items-center justify-end gap-3 pt-4">
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

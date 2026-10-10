"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { getBrandBySlug, getCategoryBySlug, type DemoProduct } from "@/lib/catalogue";
import { useKit } from "@/components/kit/kit-provider";
import { useQuickView } from "@/components/catalogue/quick-view-provider";
import { getProductImage, showWholeOnCard } from "@/lib/editorial-images";

export interface EquipmentRentalCardProps {
  product: DemoProduct;
  className?: string;
}

function primaryImage(product: DemoProduct): string | undefined {
  return product.images?.[0]?.url ?? getProductImage(product.slug, product.categorySlug);
}

/**
 * Equipment-listing-only card: white body, black category badge, black
 * brand/name bar, rust price/Rent bar — a distinct, more "spec sheet" look
 * from the green card used everywhere else on the site (product-card.tsx),
 * scoped to /equipment per the client's reference layout.
 */
function EquipmentRentalCard({ product, className }: EquipmentRentalCardProps) {
  const { addItem, items, openDrawer } = useKit();
  const { open: openQuickView } = useQuickView();
  const added = items.some((i) => i.productSlug === product.slug);
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const category = getCategoryBySlug(product.categorySlug)?.name ?? product.categorySlug;
  const priceSymbol = product.currency === "USD" ? "$" : "GHS";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-white",
        className
      )}
    >
      <button
        type="button"
        onClick={() => openQuickView(product)}
        aria-label={`View ${product.name}`}
        className="relative flex flex-col text-left"
      >
        <span className="absolute top-3 left-3 z-10 rounded-md bg-foreground px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-white uppercase">
          {category}
        </span>

        <div
          className="relative aspect-4/3 w-full"
          style={{ background: "linear-gradient(180deg, #ffffff 0%, #e4e4e4 100%)" }}
        >
          {primaryImage(product) ? (
            <Image
              src={primaryImage(product)!}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={cn(
                "p-6",
                showWholeOnCard.has(product.slug) ? "object-contain" : "object-cover p-0"
              )}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-0.5 bg-foreground px-4 py-3">
          <p className="text-[0.625rem] font-medium tracking-wide text-white/50 uppercase">{brand}</p>
          <h3 className="line-clamp-1 text-sm font-bold text-white">{product.name}</h3>
        </div>
      </button>

      <div className="grid grid-cols-2 divide-x divide-white/25 bg-[#c2672e] text-white">
        <p className="flex items-center justify-center py-2.5 text-sm font-bold">
          {product.dayRate > 0 ? `${priceSymbol} ${product.dayRate}/d` : "—"}
        </p>
        <button
          type="button"
          onClick={() => (added ? openDrawer() : addItem(product.slug))}
          className="py-2.5 text-sm font-bold transition-colors hover:bg-black/10 active:bg-black/20"
        >
          {added ? "In Cart" : "Rent"}
        </button>
      </div>
    </article>
  );
}

export { EquipmentRentalCard };

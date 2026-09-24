"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getCategoryIcon } from "@/lib/catalogue";
import { getProductGallery, getProductImage, isolatedProductPhotos } from "@/lib/editorial-images";

export interface ProductGalleryProps {
  productSlug: string;
  categorySlug: string;
  sku: string;
  name: string;
  /** Demo data has no real photography yet — this simulates a gallery of N placeholder frames. */
  frameCount?: number;
}

function ProductGallery({ productSlug, categorySlug, sku, name, frameCount = 4 }: ProductGalleryProps) {
  const icon = getCategoryIcon(categorySlug);
  const gallery = getProductGallery(productSlug);
  // Real multi-photo gallery when there's more than one photo; otherwise the
  // original single-photo layout.
  const hasGallery = gallery.length > 1;
  const image = getProductImage(productSlug, categorySlug);
  const fit = isolatedProductPhotos.has(productSlug) ? "contain" : "cover";
  const [active, setActive] = React.useState(0);
  const frames = hasGallery ? gallery : Array.from({ length: frameCount }, () => image);
  const frameTotal = frames.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden border border-border">
        <MediaPlaceholder
          src={hasGallery ? gallery[active] : image}
          alt={name}
          icon={icon}
          meta={`${sku} · ${active + 1}/${frameTotal}`}
          fit={fit}
          className="aspect-square w-full sm:aspect-4/3"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {frames.map((frameSrc, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View ${name} image ${i + 1}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "overflow-hidden border transition-all",
              active === i
                ? "border-brand"
                : "border-border hover:border-foreground/40"
            )}
          >
            <MediaPlaceholder
              src={frameSrc}
              alt={`${name} ${i + 1}`}
              icon={icon}
              fit={fit}
              className="aspect-square w-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { ProductGallery };

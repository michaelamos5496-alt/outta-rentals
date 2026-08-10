"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getCategoryIcon } from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";

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
  const image = getProductImage(productSlug, categorySlug);
  const [active, setActive] = React.useState(0);
  const frames = Array.from({ length: frameCount });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl">
        <MediaPlaceholder
          src={image}
          alt={name}
          icon={icon}
          meta={`${sku} · ${active + 1}/${frameCount}`}
          className="aspect-square w-full sm:aspect-4/3"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {frames.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View ${name} image ${i + 1}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "overflow-hidden rounded-lg ring-1 ring-inset transition-all",
              active === i
                ? "ring-2 ring-brand"
                : "ring-border hover:ring-foreground/30"
            )}
          >
            <MediaPlaceholder src={image} alt={`${name} ${i + 1}`} icon={icon} className="aspect-square w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

export { ProductGallery };

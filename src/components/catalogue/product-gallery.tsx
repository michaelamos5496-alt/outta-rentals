"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getCategoryIcon } from "@/lib/catalogue";
import type { DemoProductImage } from "@/lib/catalogue";
import { getProductGallery, getProductImage, isolatedProductPhotos } from "@/lib/editorial-images";

export interface ProductGalleryProps {
  productSlug: string;
  categorySlug: string;
  sku: string;
  name: string;
  /** Real admin-uploaded photos, when there are any — takes priority over
   * the editorial stock-photo gallery below. */
  images?: DemoProductImage[];
  /** Demo data has no real photography yet — this simulates a gallery of N placeholder frames. */
  frameCount?: number;
}

function ProductGallery({
  productSlug,
  categorySlug,
  sku,
  name,
  images,
  frameCount = 4,
}: ProductGalleryProps) {
  const icon = getCategoryIcon(categorySlug);
  const hasRealPhotos = Boolean(images && images.length > 0);
  const gallery = hasRealPhotos ? [] : getProductGallery(productSlug);
  // Real multi-photo gallery when there's more than one photo; otherwise the
  // original single-photo layout.
  const hasGallery = hasRealPhotos || gallery.length > 1;
  const image = getProductImage(productSlug, categorySlug);
  const fit = hasRealPhotos ? "cover" : isolatedProductPhotos.has(productSlug) ? "contain" : "cover";
  const [active, setActive] = React.useState(0);
  const frames: { src: string | undefined; alt: string }[] = hasRealPhotos
    ? images!.map((img, i) => ({ src: img.url, alt: img.alt || `${name} ${i + 1}` }))
    : hasGallery
      ? gallery.map((src, i) => ({ src, alt: `${name} ${i + 1}` }))
      : Array.from({ length: frameCount }, () => ({ src: image, alt: name }));
  const frameTotal = frames.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden border border-border">
        <MediaPlaceholder
          src={frames[active]?.src}
          alt={frames[active]?.alt ?? name}
          icon={icon}
          meta={`${sku} · ${active + 1}/${frameTotal}`}
          fit={fit}
          className="aspect-square w-full sm:aspect-4/3"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {frames.map((frame, i) => (
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
              src={frame.src}
              alt={frame.alt}
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

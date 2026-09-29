import Image from "next/image";

import { cn } from "@/lib/utils";
import { getProductBySlug } from "@/lib/catalogue";
import { productImages } from "@/lib/editorial-images";
import type { PackageLineItem } from "@/lib/packages";

const COLUMNS = 4;

/**
 * Column-span per cell so a trailing partial row (item count not divisible
 * by COLUMNS) stretches to fill the width instead of leaving empty grid
 * tracks — the extra span is spread across the last row's items.
 */
function computeSpans(count: number): number[] {
  const spans = new Array<number>(count).fill(1);
  const remainder = count % COLUMNS;
  if (remainder === 0 || count === 0) return spans;

  const lastRowStart = count - remainder;
  const extra = COLUMNS - remainder;
  for (let i = 0; i < extra; i++) {
    spans[lastRowStart + (i % remainder)] += 1;
  }
  return spans;
}

/**
 * Package card image as a contact-sheet grid of every item in the tier,
 * instead of one hero photo — used for packages where the actual gear
 * mix is the selling point (Commercial, Documentary). Items without a
 * real product photo yet are skipped rather than shown as a blank tile,
 * and the last row's tiles stretch to fill the width instead of leaving
 * empty grid space when the count isn't a multiple of the column count.
 */
function PackageEquipmentGrid({
  items,
  className,
}: {
  items: PackageLineItem[];
  className?: string;
}) {
  const cells = items
    .map((item) => getProductBySlug(item.productSlug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .filter((product) => Boolean(productImages[product.slug]));

  const spans = computeSpans(cells.length);

  return (
    <div
      className={cn(
        "grid grid-cols-4 auto-rows-fr gap-px overflow-hidden bg-foreground/10",
        className
      )}
    >
      {cells.map((product, i) => {
        const src = productImages[product.slug];
        return (
          <div
            key={product.slug}
            className="relative bg-white"
            style={{ gridColumn: `span ${spans[i]}` }}
          >
            <Image src={src} alt={product.name} fill sizes="120px" className="object-contain p-1" />
          </div>
        );
      })}
    </div>
  );
}

export { PackageEquipmentGrid };

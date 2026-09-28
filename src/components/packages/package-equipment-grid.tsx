import Image from "next/image";

import { cn } from "@/lib/utils";
import { getProductBySlug } from "@/lib/catalogue";
import { productImages } from "@/lib/editorial-images";
import type { PackageLineItem } from "@/lib/packages";

/**
 * Package card image as a contact-sheet grid of every item in the tier,
 * instead of one hero photo — used for packages where the actual gear
 * mix is the selling point (Commercial).
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
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <div
      className={cn(
        "grid grid-cols-4 auto-rows-fr gap-px overflow-hidden bg-foreground/10",
        className
      )}
    >
      {cells.map((product) => {
        const src = productImages[product.slug];
        return (
          <div key={product.slug} className="relative bg-white">
            {src ? (
              <Image
                src={src}
                alt={product.name}
                fill
                sizes="120px"
                className="object-contain p-1"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export { PackageEquipmentGrid };

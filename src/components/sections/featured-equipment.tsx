"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { CornerAccent } from "@/components/ui/corner-accent";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { type DemoProduct } from "@/lib/catalogue";
import { cn } from "@/lib/utils";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";
import { useKit } from "@/components/kit/kit-provider";

// Quiet editorial card — same anatomy at every breakpoint: image, name,
// tabular price, one small green accent button. Matches the catalogue
// grid's ProductCard.
function FeaturedCard({ product }: { product: DemoProduct }) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const href = `/equipment/${product.slug}`;

  React.useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <motion.article variants={slideUp()} className="group/product">
      <Link href={href} className="block active:opacity-80">
        <div className="relative overflow-hidden rounded-lg">
          <MediaPlaceholder
            src={getProductImage(product.slug, product.categorySlug)}
            alt={product.name}
            className="aspect-4/3 w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
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
    </motion.article>
  );
}

function FeaturedEquipment({ products }: { products: DemoProduct[] }) {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <Heading level="h2" eyebrow="Featured Equipment">
          The kit we&rsquo;d take.
        </Heading>
        <p className="text-small max-w-sm">
          A pull from the full catalogue — everything here can be added straight to your kit.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:gap-x-4 sm:gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {products.map((product) => (
          <FeaturedCard key={product.id} product={product} />
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };

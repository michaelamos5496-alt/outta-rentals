"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getBrandBySlug, getCategoryBySlug, type DemoProduct } from "@/lib/catalogue";
import { cn } from "@/lib/utils";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";
import { useKit } from "@/components/kit/kit-provider";

// Soft rounded "product tile" card — brand name + category label up top,
// short description, large photo, price tag and a circular quick-add
// button bottom-corners over the photo.
function FeaturedCard({ product }: { product: DemoProduct }) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const href = `/equipment/${product.slug}`;
  const brand = getBrandBySlug(product.brandSlug);
  const category = getCategoryBySlug(product.categorySlug);

  React.useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <motion.article
      variants={slideUp()}
      className="group/product relative overflow-hidden rounded-2xl border border-border bg-background"
    >
      <Link href={href} className="block active:opacity-80">
        <div className="flex items-start justify-between gap-2 p-3 pb-1.5 sm:p-3.5 sm:pb-1.5">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-bold leading-tight text-foreground">
              {product.name}
            </p>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">
              {brand?.name ?? product.brandSlug}
              {category ? ` · ${category.name}` : ""}
            </p>
          </div>
          <p className="hidden max-w-[40%] text-right text-[0.625rem] leading-snug text-muted-foreground sm:line-clamp-2 sm:block">
            {product.shortDescription}
          </p>
        </div>

        <div className="relative mt-1 bg-brand">
          <MediaPlaceholder
            src={getProductImage(product.slug, product.categorySlug)}
            alt={product.name}
            className="aspect-[16/11] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
          />
          <span className="absolute right-2 bottom-2 bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold">
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
          "absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full transition-colors active:scale-90",
          added ? "bg-brand text-brand-foreground" : "bg-foreground text-background"
        )}
      >
        {added ? <Check className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
      </button>
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

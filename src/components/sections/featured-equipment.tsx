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

// Featured equipment uses the same clapper-board treatment as the catalogue
// grid, so either path into the kit has a recognisably cinematic object.
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
      className="group/product relative isolate pt-7"
    >
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
            added ? "bg-brand text-brand-foreground" : "bg-background text-foreground"
          )}
        >
          {added ? <Check className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
        </button>
      </div>
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

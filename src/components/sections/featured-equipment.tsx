"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import {
  getBrandBySlug,
  availabilityLabels,
  availabilityVariant,
  type DemoProduct,
} from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";
import { useKit } from "@/components/kit/kit-provider";

function FeaturedCard({ product }: { product: DemoProduct }) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const href = `/equipment/${product.slug}`;

  React.useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <motion.article variants={slideUp()} className="group/product">
      <Link href={href} className="block overflow-hidden rounded-xl">
        <MediaPlaceholder
          src={getProductImage(product.slug, product.categorySlug)}
          alt={product.name}
          meta={product.sku}
          className="aspect-4/3 w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
        />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-label text-muted-foreground">{brand}</p>
          <Link href={href}>
            <h3 className="mt-1 font-medium leading-snug hover:text-brand">{product.name}</h3>
          </Link>
        </div>
        <Badge
          variant={availabilityVariant[product.availability]}
          className="hidden shrink-0 sm:inline-flex"
        >
          {availabilityLabels[product.availability]}
        </Badge>
      </div>
      <p className="text-small mt-2 hidden line-clamp-2 sm:block">{product.shortDescription}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="font-medium">{formatPrice(product.dayRate)}</span>
          <span className="text-muted-foreground"> / day</span>
        </p>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={href}>View</Link>
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
        className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {products.map((product) => (
          <FeaturedCard key={product.id} product={product} />
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };

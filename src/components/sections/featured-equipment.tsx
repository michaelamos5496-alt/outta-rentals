"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { featuredProducts } from "@/lib/placeholder-data";
import { categoryImages } from "@/lib/editorial-images";

const availabilityVariant = {
  Available: "outline",
  Limited: "technical",
  "On request": "secondary",
} as const;

function FeaturedEquipment() {
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <Heading level="h2" eyebrow="Featured Equipment">
          The kit we&rsquo;d take.
        </Heading>
        <p className="text-small max-w-sm">
          Sample equipment for illustration — the full catalogue arrives in a
          later phase.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {featuredProducts.map((product) => (
          <motion.article key={product.name} variants={slideUp()} className="group/product">
            <div className="overflow-hidden rounded-xl">
              <MediaPlaceholder
                src={categoryImages[product.category.toLowerCase()]}
                alt={product.name}
                icon={product.icon}
                meta={product.category}
                className="aspect-4/3 w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/product:scale-105"
              />
            </div>
            <div className="mt-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-label text-muted-foreground">{product.brand}</p>
                <h3 className="mt-1 font-medium leading-snug">{product.name}</h3>
              </div>
              <Badge variant={availabilityVariant[product.availability]} className="shrink-0">
                {product.availability}
              </Badge>
            </div>
            <p className="text-small mt-2">{product.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm">
                <span className="font-medium">{product.dayRate}</span>
                <span className="text-muted-foreground"> / day</span>
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  View
                </Button>
                <Button variant="secondary" size="sm">
                  <Plus /> Add to Kit
                </Button>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}

export { FeaturedEquipment };

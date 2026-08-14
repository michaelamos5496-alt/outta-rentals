"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { equipmentCategories } from "@/lib/placeholder-data";
import type { DemoProduct } from "@/lib/catalogue";

interface CategoryExperienceProps {
  products: DemoProduct[];
}

// A row of tall vertical "stripes" — one per category, name set in rotated
// vertical type, icon at top and real item count at the bottom. Reads like
// a filmstrip, which fits a cinema-equipment brand better than a grid of
// square tiles.
function CategoryExperience({ products }: CategoryExperienceProps) {
  return (
    <Section spacing="compact" className="border-t border-border">
      <div className="py-8">
        <Heading level="h2" eyebrow="The Range">
          Built by category.
        </Heading>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.05)}
        className="scrollbar-none flex gap-2 overflow-x-auto pb-2 sm:gap-3"
      >
        {equipmentCategories
          .map((category) => ({
            category,
            count: products.filter((p) => p.categorySlug === category.slug).length,
          }))
          .filter(({ count }) => count > 0)
          .map(({ category, count }) => {
            return (
            <motion.div key={category.slug} variants={slideUp()} className="shrink-0">
              <Link
                href={`/equipment/${category.slug}`}
                className="group/cat relative flex h-72 w-24 flex-col items-center justify-between overflow-hidden rounded-2xl border-2 border-brand bg-background p-4 transition-transform duration-300 ease-out hover:-translate-y-1 sm:h-80 sm:w-28"
              >
                <span className="bg-brand-muted text-brand flex size-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover/cat:-translate-y-0.5">
                  <category.icon className="size-4" strokeWidth={1.75} />
                </span>
                <span
                  className="flex-1 py-4 text-sm font-bold tracking-wide text-foreground [writing-mode:vertical-rl]"
                  style={{ transform: "rotate(180deg)" }}
                >
                  {category.name}
                </span>
                <span className="text-meta">{count} items</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

export { CategoryExperience };

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

// A row of compact square tiles — one per category, icon as the symbol and
// real item count underneath. No spelled-out name on the card (long ones
// like "Lighting Modifiers" made the old vertical-text stripe very tall) —
// the name is still available via title/aria-label for hover and screen
// readers.
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
          .map(({ category, count }) => (
            <motion.div key={category.slug} variants={slideUp()} className="shrink-0">
              <Link
                href={`/equipment/${category.slug}`}
                title={category.name}
                aria-label={`${category.name} — ${count} items`}
                className="group/cat relative flex size-24 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-brand bg-background transition-transform duration-300 ease-out hover:-translate-y-1 sm:size-28"
              >
                <span className="bg-brand-muted text-brand flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover/cat:-translate-y-0.5 sm:size-12">
                  <category.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="text-meta">{count} items</span>
              </Link>
            </motion.div>
          ))}
      </motion.div>
    </Section>
  );
}

export { CategoryExperience };

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

// Same compact tile at every breakpoint — icon, name, real item count, a
// small brand-colored corner accent. Matches the mobile design; desktop no
// longer has a separate full-bleed photo-teaser variant.
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
        variants={staggerContainer(0.06)}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      >
        {equipmentCategories.map((category) => {
          const count = products.filter((p) => p.categorySlug === category.slug).length;
          return (
            <motion.div key={category.slug} variants={slideUp()}>
              <Link
                href={`/equipment/${category.slug}`}
                className="group/cat relative block overflow-hidden rounded-xl border border-border p-4 transition-colors hover:border-brand/50 sm:p-5"
              >
                <span className="bg-brand-muted text-brand flex size-10 items-center justify-center rounded-lg transition-transform duration-300 ease-out group-hover/cat:-translate-y-0.5 sm:size-12">
                  <category.icon className="size-5 sm:size-6" strokeWidth={1.75} />
                </span>
                <p className="mt-3 text-sm font-semibold sm:mt-4 sm:text-base">{category.name}</p>
                <p className="text-small mt-0.5">{count} items</p>
                <span
                  aria-hidden
                  className="bg-brand/50 absolute right-0 bottom-0 size-4 sm:size-5"
                  style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

export { CategoryExperience };

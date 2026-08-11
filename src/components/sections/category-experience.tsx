"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { equipmentCategories } from "@/lib/placeholder-data";
import { categoryImages } from "@/lib/editorial-images";

function CategoryExperience() {
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
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {equipmentCategories.map((category, i) => (
          <motion.div
            key={category.slug}
            variants={slideUp()}
            className={i === 0 ? "lg:col-span-2" : undefined}
          >
            <Link
              href={`/equipment/${category.slug}`}
              className="group/cat relative block overflow-hidden rounded-xl"
            >
              <MediaPlaceholder
                src={categoryImages[category.slug]}
                alt={category.name}
                icon={category.icon}
                tone={i === 0 ? "hero" : "default"}
                className={
                  i === 0
                    ? "aspect-21/9 w-full transition-transform duration-700 ease-[var(--ease-outta)] group-hover/cat:scale-105"
                    : "aspect-4/5 w-full transition-transform duration-700 ease-[var(--ease-outta)] group-hover/cat:scale-105"
                }
              />
              {/* Desktop-only fix: the --background token is now white, so
                  reusing it here washed the category photos out with a white
                  haze. Pinned to black at lg+ where this card is a full
                  image tile; mobile keeps its existing look. */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent lg:from-black/80 lg:via-black/10 lg:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
                <span className="text-h3 transition-transform duration-300 ease-out group-hover/cat:-translate-y-1 lg:text-white">
                  {category.name}
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/25 transition-all duration-300 ease-out group-hover/cat:-translate-y-1 group-hover/cat:border-brand group-hover/cat:bg-brand group-hover/cat:text-brand-foreground lg:border-white/30 lg:text-white">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

export { CategoryExperience };

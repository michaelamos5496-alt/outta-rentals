"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { kitPresets } from "@/lib/placeholder-data";
import { getPackageBySlug } from "@/lib/packages";
import { getProductBySlug } from "@/lib/catalogue";
import { formatPrice } from "@/lib/currency";
import { themeImages } from "@/lib/editorial-images";

function slugifyPresetName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function BuildYourKit() {
  return (
    <Section id="build-your-kit" className="scroll-mt-20 border-t border-border">
      <div className="max-w-2xl">
        <Heading level="h2" eyebrow="Build Your Kit">
          Build your kit.
        </Heading>
        <p className="text-body mt-4">
          Tell us what you&rsquo;re shooting. We&rsquo;ll help you put the right
          equipment together.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.05)}
        className="mt-10 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4"
      >
        {kitPresets.map((preset) => {
          const slug = slugifyPresetName(preset.name);
          const pkg = getPackageBySlug(slug);
          const href = pkg ? `/packages/${slug}` : "/services";

          // Real total day rate for the package's line items — same "price
          // tag" pattern as the equipment cards, computed from real product
          // rates rather than invented.
          const dayRate = pkg
            ? pkg.items.reduce((sum, item) => {
                const product = getProductBySlug(item.productSlug);
                return sum + (product ? product.dayRate * item.quantity : 0);
              }, 0)
            : 0;
          const currency = pkg
            ? (getProductBySlug(pkg.items[0]?.productSlug ?? "")?.currency ?? "GHS")
            : "GHS";

          return (
            <motion.article
              key={preset.name}
              variants={slideUp()}
              className="group/preset relative overflow-hidden rounded-2xl bg-brand"
            >
              <Link href={href} className="block active:opacity-80">
                <div className="flex items-start justify-between gap-2 p-3 pb-1.5 sm:p-3.5 sm:pb-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold leading-tight text-brand-foreground">
                      {preset.name}
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-brand-foreground/70">Kit preset</p>
                  </div>
                  <p className="hidden max-w-[45%] text-right text-[0.625rem] leading-snug text-brand-foreground/70 sm:line-clamp-2 sm:block">
                    {preset.description}
                  </p>
                </div>

                <div className="relative mt-1">
                  <MediaPlaceholder
                    src={themeImages[slug]}
                    alt={preset.name}
                    icon={preset.icon}
                    className="aspect-[16/11] w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/preset:scale-105"
                  />
                  {pkg && dayRate > 0 ? (
                    <span className="absolute right-2 bottom-2 bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold">
                      From {formatPrice(dayRate, currency)}/day
                    </span>
                  ) : null}
                </div>
              </Link>

              <Link
                href={href}
                aria-label={`Build ${preset.name} package`}
                className="bg-foreground text-background absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full transition-transform active:scale-90"
              >
                <ArrowUpRight className="size-3.5" />
              </Link>
            </motion.article>
          );
        })}
      </motion.div>
    </Section>
  );
}

export { BuildYourKit };

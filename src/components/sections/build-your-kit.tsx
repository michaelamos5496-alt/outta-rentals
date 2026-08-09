"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { kitPresets } from "@/lib/placeholder-data";
import { getPackageBySlug } from "@/lib/packages";

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
        className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {kitPresets.map((preset) => {
          const slug = slugifyPresetName(preset.name);
          const hasPackage = Boolean(getPackageBySlug(slug));

          return (
            <motion.div
              key={preset.name}
              variants={slideUp()}
              className="group/preset flex flex-col overflow-hidden rounded-xl border border-border"
            >
              <MediaPlaceholder
                icon={preset.icon}
                className="aspect-square w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/preset:scale-105"
              />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-medium">{preset.name}</h3>
                <p className="text-small mt-1.5 flex-1">{preset.description}</p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full" disabled={!hasPackage}>
                  {hasPackage ? (
                    <Link href={`/packages/${slug}`}>Build Package</Link>
                  ) : (
                    <span>Build Package</span>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

export { BuildYourKit };

"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/section";
import { Divider } from "@/components/ui/divider";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { aboutSections } from "@/lib/content/about";
import { Compass } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Section spacing="compact" className="pt-16 sm:pt-20">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.08)}>
          <motion.p variants={slideUp()} className="text-label text-brand">
            About OUTTA
          </motion.p>
          <motion.h1 variants={slideUp(0.05)} className="text-display mt-4 max-w-3xl">
            WE DON&rsquo;T JUST RENT KIT.
            <br />
            WE HELP PRODUCTIONS MOVE.
          </motion.h1>
          <motion.p variants={slideUp(0.1)} className="text-body mt-6 max-w-xl">
            OUTTA RENTALS is a production-equipment company built around
            getting the right gear to the right shoot, backed by people who
            understand how it actually gets used on set.
          </motion.p>
        </motion.div>
      </Section>

      <Section spacing="none" bleed className="border-y border-border">
        <MediaPlaceholder icon={Compass} tone="hero" className="aspect-21/9 w-full rounded-none sm:aspect-32/9" />
      </Section>

      <Section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.08)}
          className="mx-auto max-w-3xl"
        >
          {aboutSections.map((section, i) => (
            <motion.div key={section.eyebrow} variants={slideUp()}>
              {i !== 0 ? <Divider className="my-10" /> : null}
              <p className="text-label text-brand">{section.eyebrow}</p>
              <h2 className="text-h3 mt-3">{section.title}</h2>
              <p className="text-body mt-3">{section.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </>
  );
}

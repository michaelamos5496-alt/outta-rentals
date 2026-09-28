"use client";

import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { whyOutta } from "@/lib/placeholder-data";

function WhyOutta() {
  return (
    <Section className="border-t border-border">
      <Heading level="h2" eyebrow="Why OUTTA">
        Why OUTTA?
      </Heading>

      {/* Each point as its own numbered card, watermark bottom-right — same
          "numbered feature" language the services page uses below. */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {whyOutta.map((point) => (
          <motion.div
            key={point.index}
            variants={slideUp()}
            className="relative flex min-h-[13rem] flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -bottom-6 font-heading text-[6.5rem] leading-none font-bold text-foreground/5 select-none"
            >
              {point.index}
            </span>
            <p className="text-label text-brand relative">Point {point.index}</p>
            <h3 className="text-h3 relative">{point.title}</h3>
            <p className="text-small relative mt-auto max-w-xs">{point.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

export { WhyOutta };

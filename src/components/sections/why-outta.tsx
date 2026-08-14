"use client";

import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { whyOutta } from "@/lib/placeholder-data";

function WhyOutta() {
  return (
    <Section className="border-t border-border">
      <Heading level="h2" eyebrow="Why OUTTA">
        Why OUTTA?
      </Heading>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10"
      >
        {whyOutta.map((point, i) => (
          <motion.div key={point.index} variants={slideUp()}>
            {i !== 0 ? <Divider /> : null}
            <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-baseline sm:gap-8 sm:py-8">
              <span className="text-meta text-brand sm:w-16 sm:shrink-0">
                {point.index}
              </span>
              <h3 className="text-h3 sm:w-72 sm:shrink-0">{point.title}</h3>
              <p className="text-body sm:flex-1">{point.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

export { WhyOutta };

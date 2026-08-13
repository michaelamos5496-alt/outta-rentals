"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/lib/placeholder-data";

function Testimonials() {
  return (
    <Section className="border-t-2 border-foreground">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <Heading level="h2" eyebrow="Testimonials">
          What productions say.
        </Heading>
        <Badge variant="technical">Sample quotes — not yet live</Badge>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {testimonials.map((testimonial) => (
          <motion.figure
            key={testimonial.role}
            variants={slideUp()}
            className="flex flex-col border-2 border-foreground p-6"
          >
            <Quote className="size-5 text-brand" strokeWidth={1.5} />
            <blockquote className="text-body mt-4 flex-1 text-balance italic">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="text-label mt-6 text-muted-foreground">
              {testimonial.role}
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </Section>
  );
}

export { Testimonials };

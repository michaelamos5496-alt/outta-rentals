"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { testimonials } from "@/lib/placeholder-data";
import { testimonialImages } from "@/lib/editorial-images";

// Hover (or focus/tap) a thumbnail to feature it — its photo crossfades
// into the large frame, its quote appears alongside, and the thumbnail
// itself scales up under the cursor.
function Testimonials() {
  const [active, setActive] = React.useState(0);
  const testimonial = testimonials[active];

  return (
    <Section className="border-t border-border">
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
        className="mt-10"
      >
        <motion.div variants={slideUp()} className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:w-64 sm:shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.base, ease: easeOutta }}
                className="absolute inset-0"
              >
                <Image
                  src={testimonialImages[active % testimonialImages.length]}
                  alt={testimonial.role}
                  fill
                  sizes="256px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <Quote className="size-6 text-brand" strokeWidth={1.5} />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: duration.base, ease: easeOutta }}
                className="text-h3 mt-4 max-w-xl text-balance"
              >
                &ldquo;{testimonial.quote}&rdquo;
              </motion.blockquote>
            </AnimatePresence>
            <p className="text-label mt-6 text-muted-foreground">{testimonial.role}</p>
          </div>
        </motion.div>

        <motion.div variants={slideUp(0.1)} className="mt-8 flex gap-3">
          {testimonials.map((item, i) => (
            <button
              key={item.role}
              type="button"
              aria-label={`Show testimonial from ${item.role}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "relative block size-16 shrink-0 overflow-hidden rounded-xl transition-all duration-200 ease-out sm:size-20",
                i === active
                  ? "scale-110 ring-2 ring-brand ring-offset-2"
                  : "opacity-60 hover:scale-105 hover:opacity-100"
              )}
            >
              <Image
                src={testimonialImages[i % testimonialImages.length]}
                alt={item.role}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  );
}

export { Testimonials };

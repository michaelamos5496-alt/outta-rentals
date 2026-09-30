"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { SlideIndicators, scrollToSlide, useSlideIndex } from "@/components/ui/slide-indicators";
import { whyOutta } from "@/lib/placeholder-data";

function WhyOutta() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeSlide = useSlideIndex(scrollRef, whyOutta.length);

  return (
    <Section className="border-t border-border">
      <div className="text-center">
        <Heading level="h2" eyebrow="Why OUTTA">
          Why OUTTA?
        </Heading>
      </div>

      {/* Each point as its own numbered card, watermark bottom-right — same
          "numbered feature" language the services page uses below. Mobile
          gets a swipeable slide-to-slide carousel (scroll-snap, one card
          per screen) instead of a long vertical stack; desktop keeps the
          grid below. */}
      <div
        ref={scrollRef}
        className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:hidden"
      >
        {whyOutta.map((point) => (
          <div
            key={point.index}
            className="relative flex min-h-[13rem] w-full shrink-0 snap-center flex-col gap-3 overflow-hidden rounded-2xl border border-brand bg-[oklch(0.97_0.025_143)] p-6 shadow-md"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -bottom-6 font-heading text-[6.5rem] leading-none font-bold text-brand/10 select-none"
            >
              {point.index}
            </span>
            <p className="text-label text-brand relative">Point {point.index}</p>
            <h3 className="text-h3 relative">{point.title}</h3>
            <p className="text-small relative mt-auto max-w-xs">{point.description}</p>
          </div>
        ))}
      </div>

      <SlideIndicators
        count={whyOutta.length}
        active={activeSlide}
        onSelect={(i) => scrollToSlide(scrollRef, i)}
        className="mt-4 sm:hidden"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4"
      >
        {whyOutta.map((point) => (
          <motion.div
            key={point.index}
            variants={slideUp()}
            className="relative flex min-h-[13rem] flex-col gap-3 overflow-hidden rounded-2xl border border-brand bg-[oklch(0.97_0.025_143)] p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -bottom-6 font-heading text-[6.5rem] leading-none font-bold text-brand/10 select-none"
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

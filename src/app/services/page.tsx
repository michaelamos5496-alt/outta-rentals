"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { SlideIndicators, scrollToSlide, useSlideIndex } from "@/components/ui/slide-indicators";
import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { serviceDetails } from "@/lib/content/services";

export default function ServicesPage() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeSlide = useSlideIndex(scrollRef, serviceDetails.length);

  return (
    <>
      {/* Plain page heading — no colored banner, same understated look as
          Why OUTTA and About, so the whole page (not just the card grid
          below) matches. */}
      <Section spacing="compact" className="pt-16 sm:pt-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <Heading level="h1" eyebrow="Services">
            More than equipment.
          </Heading>
          <WhatsAppButton
            label="Talk to OUTTA"
            heading="OUTTA RENTALS — SERVICES ENQUIRY"
            closingLine="I'd like to talk about a service."
            size="lg"
            variant="default"
            className="uppercase tracking-wide"
          />
          <p className="text-body max-w-xl">
            Renting gear is the easy part. OUTTA is built around everything
            around the rental — support, delivery, prep and the technical
            judgment to get a kit right the first time.
          </p>
        </div>

        {/* Same numbered-card language as the homepage's "Why OUTTA" row — a
            plain kicker/title/description card with a large number
            watermark, nothing else competing with it. The whole card links
            out, with the same circular arrow the package cards use instead
            of a button. Mobile gets a swipeable slide-to-slide carousel
            instead of a long vertical stack; desktop keeps the grid below. */}
        <div
          ref={scrollRef}
          className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:hidden"
        >
          {serviceDetails.map((service, i) => (
            <div key={service.slug} className="relative w-full shrink-0 snap-center">
              <Link
                href={service.cta.href}
                className="relative flex min-h-[13rem] flex-col gap-3 overflow-hidden rounded-2xl border border-brand bg-card p-6 shadow-md transition-[border-color,box-shadow] duration-300 hover:border-brand/70 hover:shadow-lg"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -bottom-6 font-heading text-[6.5rem] leading-none font-bold text-brand/10 select-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-label text-brand relative">{service.name}</p>
                <h2 className="text-h3 relative">{service.headline}</h2>
                <p className="text-small relative mt-auto max-w-xs">{service.description}</p>
              </Link>
              <Link
                href={service.cta.href}
                aria-label={service.cta.label}
                className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-white text-foreground transition-transform active:scale-90"
              >
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <SlideIndicators
          count={serviceDetails.length}
          active={activeSlide}
          onSelect={(i) => scrollToSlide(scrollRef, i)}
          className="mt-4 sm:hidden"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.06)}
          className="mt-10 hidden flex-wrap justify-center gap-3 sm:flex"
        >
          {serviceDetails.map((service, i) => (
            <motion.div key={service.slug} variants={slideUp()} className="relative w-44 shrink-0">
              <Link
                href={service.cta.href}
                className="relative flex min-h-[12rem] flex-col gap-2 overflow-hidden rounded-2xl border border-brand bg-card p-3 shadow-md transition-[border-color,box-shadow] duration-300 hover:border-brand/70 hover:shadow-lg"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -bottom-3 font-heading text-[3.5rem] leading-none font-bold text-brand/10 select-none"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-label text-brand relative text-[0.625rem]">{service.name}</p>
                <h2 className="text-sm font-semibold leading-snug relative">{service.headline}</h2>
                <p className="text-small relative mt-auto line-clamp-4 max-w-xs">{service.description}</p>
              </Link>
              <Link
                href={service.cta.href}
                aria-label={service.cta.label}
                className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-white text-foreground transition-transform active:scale-90"
              >
                <ArrowUpRight className="size-3.5" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </>
  );
}

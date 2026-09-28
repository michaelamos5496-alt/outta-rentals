"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { serviceDetails } from "@/lib/content/services";

// Same five services this homepage teaser has always led with — the rest
// (crew support, custom packages) live on the full /services page.
const FEATURED_SLUGS = [
  "equipment-rental",
  "production-support",
  "delivery-collection",
  "prep-testing",
  "technical-support",
];

function Services() {
  const featured = FEATURED_SLUGS.map((slug) => serviceDetails.find((s) => s.slug === slug)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );

  return (
    <Section className="border-t border-border">
      <Heading level="h2" eyebrow="Services">
        More than equipment.
      </Heading>

      {/* Same numbered-card language as Why OUTTA and the full Services
          page — green outline, green watermark number. */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.06)}
        className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {featured.map((service, i) => (
          <motion.div key={service.slug} variants={slideUp()} className="relative">
            <Link
              href={service.cta.href}
              className="relative flex min-h-[13rem] flex-col gap-3 overflow-hidden rounded-2xl border border-brand bg-card p-6 transition-colors hover:border-brand/70"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -bottom-6 font-heading text-[6.5rem] leading-none font-bold text-brand/10 select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-label text-brand relative">{service.name}</p>
              <h3 className="text-h3 relative">{service.headline}</h3>
              <p className="text-small relative mt-auto max-w-xs">{service.description}</p>
            </Link>
            <Link
              href={service.cta.href}
              aria-label={service.cta.label}
              className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-90"
            >
              <ArrowUpRight className="size-3.5" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

export { Services };

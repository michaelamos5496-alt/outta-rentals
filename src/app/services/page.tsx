"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { serviceDetails } from "@/lib/content/services";

export default function ServicesPage() {
  return (
    <>
      <Section spacing="none" bleed className="bg-brand py-16 sm:py-24">
        <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-label !text-brand-foreground/70">Services</p>
            <h1 className="text-display mt-4 max-w-2xl text-brand-foreground">
              More than equipment.
            </h1>
            <p className="text-body mt-6 max-w-xl !text-brand-foreground/80">
              Renting gear is the easy part. OUTTA is built around everything
              around the rental — support, delivery, prep and the technical
              judgment to get a kit right the first time.
            </p>
          </div>
          <WhatsAppButton
            label="Talk to OUTTA"
            heading="OUTTA RENTALS — SERVICES ENQUIRY"
            closingLine="I'd like to talk about a service."
            size="lg"
            variant="secondary"
            className="shrink-0 uppercase tracking-wide"
          />
        </Container>
      </Section>

      {/* Numbered card grid — each service carries its number as a large
          watermark, same treatment as the homepage's "Why OUTTA" row. */}
      <Section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.06)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {serviceDetails.map((service, i) => (
            <motion.article
              key={service.slug}
              variants={slideUp()}
              className="relative flex min-h-[17rem] flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-7"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -bottom-6 font-heading text-[6.5rem] leading-none font-bold text-foreground/5 select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <service.icon className="text-brand relative size-6" strokeWidth={1.75} />
              <p className="text-label text-brand relative mt-1">{service.name}</p>
              <h2 className="text-h3 relative">{service.headline}</h2>
              <p className="text-small relative max-w-xs">{service.description}</p>
              <Button asChild variant="outline" size="sm" className="relative mt-auto w-fit">
                <Link href={service.cta.href}>{service.cta.label}</Link>
              </Button>
            </motion.article>
          ))}
        </motion.div>
      </Section>
    </>
  );
}

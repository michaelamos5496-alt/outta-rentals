"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { slideUp, viewportOnce } from "@/lib/motion";
import { serviceDetails } from "@/lib/content/services";

export default function ServicesPage() {
  return (
    <>
      <Section spacing="compact" className="pt-16 sm:pt-20">
        <Heading level="display" eyebrow="Services">
          More than equipment.
        </Heading>
        <p className="text-body mt-6 max-w-xl">
          Renting gear is the easy part. OUTTA is built around everything
          around the rental — support, delivery, prep and the technical
          judgment to get a kit right the first time.
        </p>
      </Section>

      <div className="border-t border-border">
        {serviceDetails.map((service, i) => (
          <motion.article
            key={service.slug}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={slideUp()}
            className="border-b border-border"
          >
            <Section spacing="compact">
              <div
                className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="overflow-hidden rounded-xl">
                  <MediaPlaceholder icon={service.icon} className="aspect-4/3 w-full sm:aspect-16/9" />
                </div>
                <div>
                  <p className="text-label text-brand">{service.name}</p>
                  <h2 className="text-h2 mt-3 max-w-md">{service.headline}</h2>
                  <p className="text-body mt-4 max-w-md">{service.description}</p>
                  <Button asChild className="mt-6">
                    <Link href={service.cta.href}>{service.cta.label}</Link>
                  </Button>
                </div>
              </div>
            </Section>
          </motion.article>
        ))}
      </div>
    </>
  );
}

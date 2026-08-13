"use client";

import { motion } from "framer-motion";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { services } from "@/lib/placeholder-data";

function Services() {
  return (
    <Section className="border-t-2 border-foreground">
      <Heading level="h2" eyebrow="Services">
        More than equipment.
      </Heading>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.05)}
        className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service, i) => (
          <motion.div key={service.name} variants={slideUp()} className="flex gap-4">
            <span className="text-meta text-brand">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-small mt-1.5">{service.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

export { Services };

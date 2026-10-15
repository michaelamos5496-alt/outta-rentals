"use client";

import { motion } from "framer-motion";

import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/contact/contact-form";
import { slideUp, viewportOnce } from "@/lib/motion";

/** The step-by-step contact form, as the last section of the home page. */
function HomeContact() {
  return (
    <Section className="border-t border-border">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={slideUp()}
        className="max-w-3xl"
      >
        <div className="flex gap-5">
          <span aria-hidden className="bg-brand w-1 shrink-0" />
          <div>
            <p className="text-base text-black/90">How to contact us</p>
            <h2 className="mt-1 text-4xl font-medium tracking-tight sm:text-6xl">Contacts</h2>
          </div>
        </div>
        <div className="mt-16">
          <ContactForm />
        </div>
      </motion.div>
    </Section>
  );
}

export { HomeContact };

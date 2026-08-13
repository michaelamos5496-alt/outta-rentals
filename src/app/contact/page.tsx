"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Divider } from "@/components/ui/divider";
import { slideUp, staggerContainer } from "@/lib/motion";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";

const infoRows = [
  { icon: Mail, label: "Email", value: "hello@outtarentals.com (placeholder)" },
  { icon: Phone, label: "Phone", value: "+000 000 0000 (placeholder)" },
  { icon: MapPin, label: "Location", value: "City, Country (placeholder)" },
  { icon: Clock, label: "Opening hours", value: "Mon–Sat, 8am–6pm (placeholder)" },
];

export default function ContactPage() {
  return (
    <Section className="pt-16 sm:pt-20">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.08)}>
        <motion.p variants={slideUp()} className="text-label text-brand">
          Contact
        </motion.p>
        <motion.h1 variants={slideUp(0.05)} className="text-display mt-4 max-w-2xl">
          LET&rsquo;S TALK ABOUT
          <br />
          YOUR NEXT SHOOT.
        </motion.h1>
        <motion.p variants={slideUp(0.1)} className="text-body mt-6 max-w-lg">
          Questions about a kit, a shoot date, or anything else — reach out
          and OUTTA will get back to you directly.
        </motion.p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <ContactForm />

        <aside className="flex h-fit flex-col gap-6 border-2 border-foreground p-6 lg:sticky lg:top-24">
          <div>
            <p className="text-label mb-3">Prefer WhatsApp?</p>
            <WhatsAppButton
              label="Message OUTTA on WhatsApp"
              closingLine="I'd like to talk about an upcoming shoot."
              className="w-full"
            />
          </div>

          <Divider />

          <div className="flex flex-col gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <row.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-label">{row.label}</p>
                  <p className="text-small mt-0.5">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Section>
  );
}

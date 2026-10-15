"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/ui/container";
import { slideUp, staggerContainer } from "@/lib/motion";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import { getWhatsAppNumber } from "@/lib/quote/whatsapp";

const phone = getWhatsAppNumber();

const infoRows: { icon: typeof Phone; label: string; value: string; href?: string }[] = [
  { icon: MapPin, label: "Address", value: siteConfig.location, href: siteConfig.mapsUrl },
  ...(phone
    ? [{ icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` }]
    : []),
  { icon: Mail, label: "E-mail", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
];

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.location)}&z=15&output=embed`;

/**
 * The whole contact layout — heading, address/phone/e-mail, the step-by-step
 * form and the dimmed map behind it. Used as the Contact page and as the
 * last section of the home page.
 */
function ContactSection({ headingLevel = "h1", fullHeight = true }: { headingLevel?: "h1" | "h2"; fullHeight?: boolean }) {
  const Heading = headingLevel;
  return (
    <section className={`relative isolate overflow-hidden bg-background text-neutral-900 ${fullHeight ? "min-h-[calc(100vh-4rem)]" : ""}`}>
      {/* Dimmed map, fading into the dark page on the left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full lg:w-[62%]"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 45%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 45%)",
        }}
      >
        <iframe
          title="OUTTA RENTALS location"
          src={mapSrc}
          loading="lazy"
          tabIndex={-1}
          className="size-full border-0 opacity-70"
          style={{ filter: "grayscale(1) contrast(0.9) brightness(1.05)" }}
        />
        <span className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-full lg:block">
          <MapPin className="size-7 fill-neutral-900 text-neutral-900" strokeWidth={1.5} />
        </span>
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/70 to-transparent" />

      <Container>
        <div className="max-w-3xl py-14 pb-32 sm:py-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.08)}>
            <motion.div variants={slideUp()} className="flex gap-5">
              <span aria-hidden className="bg-brand w-1 shrink-0" />
              <div>
                <p className="text-base text-black/90">How to contact us</p>
                <Heading className="mt-1 text-5xl font-medium tracking-tight sm:text-7xl">Contacts</Heading>
              </div>
            </motion.div>

            <motion.dl
              variants={slideUp(0.05)}
              className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10"
            >
              {infoRows.map((row) => (
                <div key={row.label}>
                  <dt className="flex items-center gap-2.5 text-sm text-neutral-900">
                    <row.icon className="size-3.5" />
                    {row.label}
                  </dt>
                  <dd className="mt-3 pl-6 text-sm leading-relaxed text-black/45">
                    {row.href ? (
                      <a
                        href={row.href}
                        {...(row.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-20 sm:mt-28"
          >
            <ContactForm />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export { ContactSection };

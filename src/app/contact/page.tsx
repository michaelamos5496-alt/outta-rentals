"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/ui/container";
import { slideUp, staggerContainer } from "@/lib/motion";
import { LocationMap } from "@/components/sections/location-map";
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

export default function ContactPage() {
  return (
    <>
    <section className="relative isolate overflow-hidden bg-background text-neutral-900">
      <Container>
        <div className="max-w-3xl py-14 sm:py-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer(0.08)}>
            <motion.div variants={slideUp()} className="flex gap-5">
              <span aria-hidden className="bg-brand w-1 shrink-0" />
              <div>
                <p className="text-base text-black/90">How to contact us</p>
                <h1 className="mt-1 text-5xl font-medium tracking-tight sm:text-7xl">Contacts</h1>
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

        </div>
      </Container>
    </section>
    <LocationMap />
    </>
  );
}

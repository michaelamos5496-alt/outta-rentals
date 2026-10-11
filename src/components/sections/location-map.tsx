"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { slideUp, viewportOnce } from "@/lib/motion";
import { siteConfig } from "@/config/site";

// No-API-key Google Maps embed pattern — pinned at OUTTA's resolved
// coordinates from siteConfig.mapsUrl (Mantse Boi St, Accra).
const MAP_EMBED_SRC = "https://maps.google.com/maps?q=5.5703901,-0.2403115&z=16&output=embed";

function LocationMap() {
  return (
    <Section className="border-t border-border">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={slideUp()}>
          <Heading level="h2" eyebrow="Find Us">
            Come See The Gear.
          </Heading>
          <p className="text-body mt-4 max-w-sm">
            Pick up, drop off, or just come take a look before you book —
            OUTTA is based right here in Accra.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <MapPin className="text-brand size-4 shrink-0" />
            <span className="text-small">{siteConfig.location}</span>
          </div>
          <Button asChild variant="outline" className="mt-6">
            <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer">
              Get Directions
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={slideUp(0.1)}
          className="overflow-hidden rounded-2xl border border-border"
        >
          <iframe
            src={MAP_EMBED_SRC}
            title={`${siteConfig.name} location map`}
            className="h-80 w-full sm:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </Section>
  );
}

export { LocationMap };

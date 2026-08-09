"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Package } from "lucide-react";

import { slideUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

function FinalCta() {
  return (
    <Section spacing="none" bleed className="relative overflow-hidden py-28 sm:py-36">
      <MediaPlaceholder tone="hero" className="absolute inset-0 h-full w-full rounded-none" />
      <div className="absolute inset-0 bg-background/70" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="relative mx-auto w-full max-w-(--container-content) px-5 text-center sm:px-8 lg:px-12"
      >
        <motion.h2 variants={slideUp()} className="text-display text-balance">
          READY TO
          <br />
          ROLL?
        </motion.h2>
        <motion.p variants={slideUp(0.05)} className="text-body mx-auto mt-6 max-w-md">
          Tell us what you&rsquo;re shooting. We&rsquo;ll help you build the
          right kit.
        </motion.p>
        <motion.div
          variants={slideUp(0.1)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="uppercase tracking-wide">
            <Link href="#build-your-kit">
              <Package /> Build Your Kit
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-foreground/25 bg-transparent uppercase tracking-wide hover:bg-foreground/5"
          >
            <Link href="/contact">
              <MessageCircle /> Talk to OUTTA
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </Section>
  );
}

export { FinalCta };

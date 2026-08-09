"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Package, Search } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

const headlineLines = ["THE KIT", "BEHIND THE", "VISION."];

function Hero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <Section
      spacing="none"
      bleed
      className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden"
    >
      <div ref={ref} className="absolute inset-0">
        <motion.div style={{ scale: bgScale }} className="absolute inset-0">
          <MediaPlaceholder
            tone="hero"
            meta="OUTTA RENTALS · PRODUCTION FOOTAGE PLACEHOLDER"
            className="h-full w-full rounded-none"
          />
        </motion.div>
        {/* Legibility scrim, heaviest toward the content at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full pt-40 pb-12 sm:pb-16"
      >
        <div className="mx-auto w-full max-w-(--container-content) px-5 sm:px-8 lg:px-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, ease: easeOutta }}
            className="text-label text-brand"
          >
            Film · Photography · Production Equipment
          </motion.p>

          <h1 className="text-display mt-4 max-w-3xl">
            {headlineLines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: duration.slow,
                    delay: 0.1 + i * 0.09,
                    ease: easeOutta,
                  }}
                  className="block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, delay: 0.45, ease: easeOutta }}
            className="text-body mt-6 max-w-md"
          >
            Professional cameras, lenses, lighting and production equipment for
            filmmakers, photographers, agencies and creators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, delay: 0.55, ease: easeOutta }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg" className="group/cta uppercase tracking-wide">
              <Link href="/equipment">
                Explore Equipment
                <ArrowRight className="transition-transform group-hover/cta:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-foreground/25 bg-transparent uppercase tracking-wide hover:bg-foreground/5"
            >
              <Link href="#build-your-kit">
                <Package /> Build Your Kit
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, delay: 0.65, ease: easeOutta }}
            className="mt-10 flex flex-col gap-3 rounded-xl border border-border bg-card/70 p-3 shadow-[var(--shadow-outta-lg)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-2 sm:p-2"
          >
            <SearchInput
              containerClassName="sm:flex-1"
              className="h-11 border-transparent bg-transparent sm:border-input"
              placeholder="Search equipment…"
            />
            <div className="grid grid-cols-1 gap-2 sm:contents">
              <label className="flex h-11 items-center gap-2 rounded-lg border border-input px-3">
                <span className="text-label shrink-0 text-muted-foreground">From</span>
                <Input
                  type="date"
                  aria-label="Start date"
                  className="h-auto min-w-0 border-0 p-0 focus-visible:ring-0"
                />
              </label>
              <label className="flex h-11 items-center gap-2 rounded-lg border border-input px-3">
                <span className="text-label shrink-0 text-muted-foreground">To</span>
                <Input
                  type="date"
                  aria-label="End date"
                  className="h-auto min-w-0 border-0 p-0 focus-visible:ring-0"
                />
              </label>
            </div>
            <Button size="lg" className="uppercase tracking-wide sm:w-auto">
              <Search /> Build Kit
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.base, delay: 1, ease: easeOutta }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-foreground/30"
        />
        <span className="text-meta text-foreground/50">Scroll</span>
      </motion.div>
    </Section>
  );
}

export { Hero };

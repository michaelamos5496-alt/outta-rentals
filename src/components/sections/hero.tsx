"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { categoryImages } from "@/lib/editorial-images";

const headlineLines = ["THE KIT", "BEHIND THE", "VISION."];

function Hero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Some browsers (notably Safari/iOS) only honor autoplay when `muted`
    // is set as a JS property, not just the HTML attribute — and .play()
    // can return a rejected promise if the policy check fails regardless.
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <Section
      spacing="none"
      bleed
      className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden"
    >
      {/* Hoisted into <head> by React — the single above-the-fold video, worth
          fetching eagerly and at high priority (unlike the deferred, lazy
          AutoplayVideo instances used everywhere else on the site). */}
      <link rel="preload" as="video" href="/video/hero.mp4" fetchPriority="high" />

      <div ref={ref} className="absolute inset-0 bg-background">
        <motion.div style={{ scale: bgScale }} className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={categoryImages.cameras}
            {...({ fetchPriority: "high" } as React.VideoHTMLAttributes<HTMLVideoElement>)}
            aria-hidden
            className="h-full w-full object-cover"
          >
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
        </motion.div>
        {/* Legibility scrim — vignette centered on the text, plus a top/bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/35 to-background/60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 50%, var(--background) 0%, transparent 100%)",
            opacity: 0.55,
          }}
        />
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full py-24"
      >
        <div className="mx-auto flex w-full max-w-(--container-content) flex-col items-center px-5 text-center sm:px-8 lg:px-12">
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
            className="text-body mx-auto mt-6 max-w-md"
          >
            Professional cameras, lenses, lighting and production equipment for
            filmmakers, photographers, agencies and creators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.base, delay: 0.55, ease: easeOutta }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
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

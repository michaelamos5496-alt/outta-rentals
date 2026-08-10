"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getBrandBySlug,
  availabilityLabels,
  availabilityVariant,
  type DemoProduct,
} from "@/lib/catalogue";
import { formatPrice } from "@/lib/currency";
import { useKit } from "@/components/kit/kit-provider";

const ROTATE_MS = 6000;

/**
 * The hero itself is the rotating flagship-equipment spotlight — modeled on
 * 711rent.com's homepage banner (one hero item at a time, direct pricing,
 * direct "rent it" CTAs) rather than a static marketing headline, on top of
 * OUTTA's own cinematic video background.
 */
function Hero({ products }: { products: DemoProduct[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);

  const product = products[index];

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Some browsers (notably Safari/iOS) only honor autoplay when `muted`
    // is set as a JS property, not just the HTML attribute — and .play()
    // can return a rejected promise if the policy check fails regardless.
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  React.useEffect(() => {
    if (paused || products.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, products.length]);

  React.useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const brand = product ? getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug : "";

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
            poster="/video/hero-poster.jpg"
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
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="mx-auto flex w-full max-w-(--container-content) flex-col items-center px-5 text-center sm:px-8 lg:px-12">
          {product ? (
            <>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease: easeOutta }}
                className="text-label text-brand"
              >
                In the Spotlight · {brand}
              </motion.p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={product.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: duration.base, ease: easeOutta }}
                  className="flex flex-col items-center"
                >
                  <h1 className="text-display mt-4 max-w-3xl uppercase">{product.name}</h1>

                  <div className="mt-3 flex items-center gap-3">
                    <Badge variant={availabilityVariant[product.availability]}>
                      {availabilityLabels[product.availability]}
                    </Badge>
                    <span className="text-body text-muted-foreground">
                      {formatPrice(product.dayRate)}/day · {formatPrice(product.weekRate)}/week
                    </span>
                  </div>

                  <p className="text-body mx-auto mt-6 max-w-md">{product.shortDescription}</p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button asChild size="lg" className="group/cta uppercase tracking-wide">
                      <Link href={`/equipment/${product.slug}`}>
                        View Details
                        <ArrowRight className="transition-transform group-hover/cta:translate-x-0.5" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-foreground/25 bg-transparent uppercase tracking-wide hover:bg-foreground/5"
                      onClick={() => {
                        addItem(product.slug);
                        setAdded(true);
                      }}
                    >
                      <Plus /> {added ? "Added" : "Add to Kit"}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {products.length > 1 ? (
                <div className="mt-10 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous spotlight item"
                    onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}
                  >
                    <ChevronLeft />
                  </Button>
                  <div className="flex items-center gap-2">
                    {products.map((p, i) => (
                      <button
                        key={p.slug}
                        type="button"
                        aria-label={`Show ${p.name}`}
                        aria-pressed={i === index}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === index ? "w-8 bg-brand" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next spotlight item"
                    onClick={() => setIndex((i) => (i + 1) % products.length)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease: easeOutta }}
                className="text-label text-brand"
              >
                Film · Photography · Production Equipment
              </motion.p>
              <h1 className="text-display mt-4 max-w-3xl">THE KIT BEHIND THE VISION.</h1>
              <div className="mt-8">
                <Button asChild size="lg" className="uppercase tracking-wide">
                  <Link href="/equipment">
                    Explore Equipment <ArrowRight />
                  </Link>
                </Button>
              </div>
            </>
          )}
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

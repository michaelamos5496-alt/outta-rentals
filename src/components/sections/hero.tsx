"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/editorial-images";
import type { DemoProduct } from "@/lib/catalogue";

const ROTATE_MS = 6000;

/**
 * Full-bleed rotating hero, half viewport height — modeled directly on
 * 711rent.com's homepage banner: near-black product photography, the
 * product name set bottom-left in bold brand-color type, one CTA, slide
 * arrows, a counter, and a thumbnail strip below to jump straight to any
 * item. Deliberately minimal — no secondary copy or stats competing with
 * the photo.
 */
function Hero({ products }: { products: DemoProduct[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const product = products[index];

  React.useEffect(() => {
    if (paused || products.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, products.length]);

  if (!product) {
    return (
      <Section className="border-b border-border text-center">
        <p className="text-label text-brand">Film · Photography · Production Equipment</p>
        <h1 className="text-display mt-4">THE KIT BEHIND THE VISION.</h1>
        <Button asChild size="lg" className="mt-8 uppercase tracking-wide">
          <Link href="/equipment">
            Explore Equipment <ArrowRight />
          </Link>
        </Button>
      </Section>
    );
  }

  const image = getProductImage(product.slug, product.categorySlug);

  return (
    <>
      <Section
        spacing="none"
        bleed
        className="relative overflow-hidden border-b border-border min-h-[66svh] lg:min-h-[66vh]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Near-black product photography — a strong scrim (711rent shoots
            on pure black; our real photos are on location, so a heavier
            scrim gets the same moody, uncluttered feel) with a light
            top-to-bottom gradient so the bottom-left name stays legible. */}
        <div className="absolute inset-0 bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={product.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease: easeOutta }}
              className="absolute inset-0"
            >
              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover opacity-80"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
        </div>

        <Container className="relative flex min-h-[66svh] items-end pb-14 sm:pb-16 lg:min-h-[66vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${product.slug}-text`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: duration.base, ease: easeOutta }}
              className="max-w-xl"
            >
              <h1 className="text-display leading-[0.92] font-bold text-brand uppercase">
                {product.name}
              </h1>
              <Button asChild size="lg" className="mt-6 uppercase tracking-wide">
                <Link href={`/equipment/${product.slug}`}>
                  Rent Now <ArrowRight />
                </Link>
              </Button>
            </motion.div>
          </AnimatePresence>
        </Container>

        {products.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous spotlight item"
              onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-white/60 transition-colors hover:text-white sm:left-6"
            >
              <ChevronLeft className="size-7" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Next spotlight item"
              onClick={() => setIndex((i) => (i + 1) % products.length)}
              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-white/60 transition-colors hover:text-white sm:right-6"
            >
              <ChevronRight className="size-7" strokeWidth={1.5} />
            </button>
            <p className="text-meta absolute right-5 bottom-4 z-10 !text-white/60">
              {index + 1} / {products.length}
            </p>
          </>
        ) : null}
      </Section>

      {products.length > 1 ? (
        <div className="h-[34svh] overflow-hidden border-b border-border bg-background lg:h-[34vh]">
          <div className="animate-marquee flex h-full w-max">
            {[0, 1].map((copy) =>
              products.map((p, i) => {
                const thumb = getProductImage(p.slug, p.categorySlug);
                return (
                  <button
                    key={`${copy}-${p.slug}`}
                    type="button"
                    aria-label={`Show ${p.name}`}
                    aria-pressed={copy === 0 && i === index}
                    tabIndex={copy === 0 ? 0 : -1}
                    onClick={() => setIndex(i)}
                    className={`relative aspect-square h-full shrink-0 overflow-hidden border-r border-border transition-all ${
                      copy === 0 && i === index ? "ring-brand ring-2 ring-inset" : ""
                    }`}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={p.name}
                        fill
                        sizes="34vh"
                        className="object-cover"
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export { Hero };

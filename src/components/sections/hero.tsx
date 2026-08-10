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
 * Full-bleed rotating product-spotlight hero — modeled directly on
 * 711rent.com's homepage banner: large dramatic product photography fills
 * the frame, the product name is set in bold brand-color type directly over
 * the image, a single solid CTA button sits below it, arrow controls sit at
 * the left/right edges, a slide counter sits in the corner, and a thumbnail
 * strip below lets viewers jump straight to any item — all on OUTTA's own
 * dark/green brand rather than 711rent's light theme.
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
      <Section
        spacing="none"
        bleed
        className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-background text-center"
      >
        <div className="px-5">
          <p className="text-label text-brand">Film · Photography · Production Equipment</p>
          <h1 className="text-display mt-4">THE KIT BEHIND THE VISION.</h1>
          <Button asChild size="lg" className="mt-8 uppercase tracking-wide">
            <Link href="/equipment">
              Explore Equipment <ArrowRight />
            </Link>
          </Button>
        </div>
      </Section>
    );
  }

  const image = getProductImage(product.slug, product.categorySlug);

  return (
    <>
      {/* Mobile hero — compact brand statement over rotating gear photography.
          Desktop keeps the full-bleed 711rent-style spotlight below untouched. */}
      <Section
        spacing="none"
        bleed
        className="relative h-[78svh] min-h-[520px] w-full overflow-hidden bg-background lg:hidden"
      >
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
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/50" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end px-5 pb-10 text-center">
          <p className="text-label text-brand">Film · Photography · Production Equipment</p>
          <h1 className="text-h1 mt-3 max-w-xs uppercase">Rent the gear. Make the work.</h1>
          <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
            <Button asChild size="lg" className="w-full uppercase tracking-wide">
              <Link href="/equipment">
                Browse Equipment <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full uppercase tracking-wide">
              <Link href="/work">See What&rsquo;s Been Shot</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section
        spacing="none"
        bleed
        className="relative hidden h-[100svh] min-h-[640px] w-full overflow-hidden bg-background lg:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-background/40" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${product.slug}-text`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: duration.base, ease: easeOutta }}
              className="px-5 text-center"
            >
              <h1
                className="text-display text-brand max-w-4xl uppercase"
                style={{ textShadow: "0 4px 32px rgb(0 0 0 / 0.6)" }}
              >
                {product.name}
              </h1>
              <Button asChild size="lg" className="mt-6 uppercase tracking-wide">
                <Link href={`/equipment/${product.slug}`}>Rent Now</Link>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        {products.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous spotlight item"
              onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}
              className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-foreground/70 transition-colors hover:text-foreground sm:left-8"
            >
              <ChevronLeft className="size-8" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Next spotlight item"
              onClick={() => setIndex((i) => (i + 1) % products.length)}
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-foreground/70 transition-colors hover:text-foreground sm:right-8"
            >
              <ChevronRight className="size-8" strokeWidth={1.5} />
            </button>
            <p className="text-meta absolute right-6 bottom-6 z-10 text-foreground/70">
              {index + 1} / {products.length}
            </p>
          </>
        ) : null}
      </Section>

      {products.length > 1 ? (
        <div className="hidden border-b border-border bg-background lg:block">
          <Container>
            <div className="scrollbar-none flex gap-2 overflow-x-auto py-3">
              {products.map((p, i) => {
                const thumb = getProductImage(p.slug, p.categorySlug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Show ${p.name}`}
                    aria-pressed={i === index}
                    onClick={() => setIndex(i)}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset transition-all sm:size-20 ${
                      i === index ? "ring-2 ring-brand" : "ring-border hover:ring-foreground/30"
                    }`}
                  >
                    {thumb ? (
                      <Image src={thumb} alt={p.name} fill sizes="80px" className="object-cover" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Container>
        </div>
      ) : null}
    </>
  );
}

export { Hero };

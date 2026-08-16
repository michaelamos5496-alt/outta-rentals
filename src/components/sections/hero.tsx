"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getProductImage } from "@/lib/editorial-images";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { siteConfig } from "@/config/site";
import type { DemoProduct } from "@/lib/catalogue";

const ROTATE_MS = 6000;

/**
 * Full-bleed rotating hero, half viewport height — vivid product photography
 * (dark scrim + white text, not a pale wash) with slide arrows, a counter,
 * and a thumbnail strip to jump between spotlight items directly (711rent-
 * style). Kept deliberately light on the homepage: no floating spec card,
 * everything else about the catalogue lives on /equipment.
 */
function Hero({ products, totalCount }: { products: DemoProduct[]; totalCount: number }) {
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

  const whatsappLink = getWhatsAppLink({
    closingLine: "I'd like help finding the right kit for my shoot.",
  });

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
        className="relative overflow-hidden border-b border-border min-h-[50svh] lg:min-h-[50vh]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Full-bleed vivid photo — a dark scrim (not a pale wash) keeps the
            white text legible while the photo itself stays true and visible. */}
        <div className="absolute inset-0">
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
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40" />
        </div>

        <Container className="relative flex min-h-[50svh] items-center py-14 sm:py-16 lg:min-h-[50vh] lg:py-0">
          <div className="max-w-xl">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-6 flex max-w-md items-start gap-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center border border-white/30 bg-white/10 text-white">
                  <MessageCircle className="size-4" strokeWidth={1.75} />
                </span>
                <span className="border border-white/30 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-sm">
                  Need help sourcing the right kit? We reply fast on WhatsApp.
                </span>
              </a>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                key={`${product.slug}-text`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: duration.base, ease: easeOutta }}
              >
                <p
                  className="text-label !text-white/80"
                  style={{ textShadow: "0 2px 12px rgb(0 0 0 / 0.5)" }}
                >
                  {product.name}
                </p>
                <h1
                  className="text-display mt-1 leading-[0.95] text-white uppercase"
                  style={{ textShadow: "0 4px 24px rgb(0 0 0 / 0.5)" }}
                >
                  The Kit Behind
                  <br />
                  <span className="text-brand">The Vision.</span>
                </h1>
              </motion.div>
            </AnimatePresence>
            <p
              className="mt-5 max-w-md text-base text-white/85"
              style={{ textShadow: "0 2px 12px rgb(0 0 0 / 0.5)" }}
            >
              {siteConfig.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/equipment">
                  Explore Inventory <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-white hover:bg-white/15"
              >
                <Link href={`/equipment/${product.slug}`}>View Specs</Link>
              </Button>
            </div>

            <div
              className="mt-7 flex flex-wrap items-center gap-6 border-t border-white/20 pt-5"
              style={{ textShadow: "0 2px 12px rgb(0 0 0 / 0.5)" }}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand" />
                <span className="text-meta !text-white/80">Live Inventory</span>
              </div>
              <div>
                <span className="font-mono text-sm font-semibold text-white">{totalCount}+</span>
                <span className="text-meta ml-1.5 !text-white/80">Equipment Items</span>
              </div>
            </div>
          </div>
        </Container>

        {products.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous spotlight item"
              onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}
              className="absolute bottom-4 left-3 z-10 text-white/70 transition-colors hover:text-white sm:top-1/2 sm:bottom-auto sm:left-6 sm:-translate-y-1/2"
            >
              <ChevronLeft className="size-7" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Next spotlight item"
              onClick={() => setIndex((i) => (i + 1) % products.length)}
              className="absolute bottom-4 right-14 z-10 text-white/70 transition-colors hover:text-white sm:top-1/2 sm:right-6 sm:bottom-auto sm:-translate-y-1/2"
            >
              <ChevronRight className="size-7" strokeWidth={1.5} />
            </button>
            <p className="text-meta absolute right-5 bottom-4 z-10 !text-white/70">
              {index + 1} / {products.length}
            </p>
          </>
        ) : null}
      </Section>

      {products.length > 1 ? (
        <div className="border-b border-border bg-background">
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
                    className={`relative size-14 shrink-0 overflow-hidden border transition-all sm:size-16 ${
                      i === index ? "border-brand" : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {thumb ? (
                      <Image src={thumb} alt={p.name} fill sizes="64px" className="object-cover" />
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

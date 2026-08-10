"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getBrandBySlug, availabilityLabels, availabilityVariant, type DemoProduct } from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";
import { useKit } from "@/components/kit/kit-provider";
import { duration, easeOutta } from "@/lib/motion";

const ROTATE_MS = 6000;

/**
 * Auto-rotating spotlight banner for a handful of flagship products —
 * structurally modeled on 711rent's homepage banner (one hero item at a
 * time, large imagery, day/week pricing, direct CTAs) rather than a static
 * grid, but kept on OUTTA's own dark/cinematic styling throughout.
 */
function FeaturedSpotlight({ products }: { products: DemoProduct[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);

  const product = products[index];

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

  if (!product) return null;

  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;

  return (
    <section
      className="relative border-y border-border bg-card/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Container className="py-10 sm:py-14">
        <div className="flex items-center justify-between">
          <p className="text-label text-brand">In the Spotlight</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous spotlight item"
              onClick={() => setIndex((i) => (i - 1 + products.length) % products.length)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next spotlight item"
              onClick={() => setIndex((i) => (i + 1) % products.length)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: duration.base, ease: easeOutta }}
            className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14"
          >
            <Link
              href={`/equipment/${product.slug}`}
              className="block overflow-hidden rounded-2xl"
            >
              <MediaPlaceholder
                src={getProductImage(product.slug, product.categorySlug)}
                alt={product.name}
                className="aspect-video w-full lg:aspect-[4/3]"
              />
            </Link>

            <div className="flex flex-col justify-center">
              <div className="flex items-start justify-between gap-3">
                <p className="text-label text-muted-foreground">{brand}</p>
                <Badge variant={availabilityVariant[product.availability]}>
                  {availabilityLabels[product.availability]}
                </Badge>
              </div>
              <h2 className="text-h1 mt-2">{product.name}</h2>
              <p className="text-body mt-4 max-w-md">{product.shortDescription}</p>

              <div className="mt-6 flex items-baseline gap-6 rounded-xl border border-border p-5">
                <div>
                  <p className="text-meta">Daily rate</p>
                  <p className="text-h3 mt-1">{formatPrice(product.dayRate)}</p>
                </div>
                <div>
                  <p className="text-meta">Weekly rate</p>
                  <p className="text-h3 mt-1">{formatPrice(product.weekRate)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="uppercase tracking-wide">
                  <Link href={`/equipment/${product.slug}`}>
                    View Details <ArrowRight />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    addItem(product.slug);
                    setAdded(true);
                  }}
                >
                  <Plus /> {added ? "Added" : "Add to Kit"}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {products.length > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                aria-label={`Show ${p.name}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-brand" : "w-1.5 bg-border hover:bg-foreground/30"
                }`}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export { FeaturedSpotlight };

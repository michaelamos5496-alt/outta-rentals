"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Aperture, MessageCircle } from "lucide-react";

import { duration, easeOutta } from "@/lib/motion";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductImage } from "@/lib/editorial-images";
import { availabilityLabels, availabilityVariant, getCategoryBySlug } from "@/lib/catalogue";
import { formatPrice } from "@/lib/currency";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { siteConfig } from "@/config/site";
import type { DemoProduct } from "@/lib/catalogue";

const ROTATE_MS = 6000;

/**
 * Editorial two-column hero: headline + CTAs + a real live-inventory status
 * row on the left, a rotating product photo with a floating "Featured Gear"
 * spec card on the right. Every figure on the card (specs, rate, category,
 * availability) is pulled from real catalogue data — nothing here is
 * invented copy.
 */
function Hero({ products, totalCount }: { products: DemoProduct[]; totalCount: number }) {
  const [index, setIndex] = React.useState(0);
  const product = products[index];

  React.useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [products.length]);

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
  const category = getCategoryBySlug(product.categorySlug);

  // Real specs when the product has them; otherwise fall back to other real
  // fields (rate, category) rather than leaving the card half-empty.
  const cardRows: { label: string; value: string }[] =
    product.specifications.length > 0
      ? product.specifications.slice(0, 2).map((s) => ({ label: s.label, value: s.value }))
      : [
          { label: "Day Rate", value: `${formatPrice(product.dayRate, product.currency)}/day` },
          { label: "Category", value: category?.name ?? product.categorySlug },
        ];

  return (
    <Section
      spacing="none"
      bleed
      className="relative overflow-hidden border-b border-border lg:min-h-[calc(100vh-64px)]"
    >
      {/* Right half — full viewport height, bleeding to the browser edge.
          Absolutely positioned so the left text column can sit in a normal
          centered Container without fighting it for width. */}
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
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
                sizes="50vw"
                className="object-cover"
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${product.slug}-card`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: duration.base, ease: easeOutta }}
            className="absolute right-6 bottom-6 w-72 border border-border bg-card p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-meta">Featured Gear</span>
              <Aperture className="size-4 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <p className="text-h3 mt-2">{product.name}</p>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              {cardRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-mono font-semibold">{row.value}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Availability</dt>
                <dd>
                  <Badge variant={availabilityVariant[product.availability]}>
                    {availabilityLabels[product.availability]}
                  </Badge>
                </dd>
              </div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>

      <Container className="relative py-16 sm:py-20 lg:flex lg:min-h-[calc(100vh-64px)] lg:items-center lg:py-0">
        <div className="lg:w-1/2 lg:max-w-xl lg:pr-12">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-8 flex max-w-md items-start gap-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-brand-muted text-brand">
                <MessageCircle className="size-4" strokeWidth={1.75} />
              </span>
              <span className="border border-border px-4 py-3 text-sm text-muted-foreground">
                Need help sourcing the right kit? We reply fast on WhatsApp.
              </span>
            </a>
          ) : null}

          <h1 className="text-display leading-[0.95] uppercase">
            <span className="block">The Kit Behind</span>
            <span className="block text-brand">The Vision.</span>
          </h1>
          <p className="text-body mt-6 max-w-md">{siteConfig.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/equipment">
                Explore Inventory <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/equipment/${product.slug}`}>View Specs</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-8 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand" />
              <span className="text-meta">Live Inventory</span>
            </div>
            <div>
              <span className="font-mono text-sm font-semibold">{totalCount}+</span>
              <span className="text-meta ml-1.5">Equipment Items</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export { Hero };

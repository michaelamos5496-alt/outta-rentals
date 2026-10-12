"use client";

import * as React from "react";
import Link from "next/link";
import { List, MousePointerClick, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getProductBySlug } from "@/lib/catalogue";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";
import { useKit } from "@/components/kit/kit-provider";
import { useElasticHoverScale } from "@/lib/elastic-hover";
import type { ChooserPackage, ChooserTier } from "@/lib/packages/chooser";
import { SlideIndicators, scrollToSlide, useSlideIndex } from "@/components/ui/slide-indicators";

function formatGhc(amount: number, currency: string): string {
  const figure = amount.toLocaleString("en-GB");
  return currency === "GHS" ? `GHC ${figure}` : `${currency} ${figure}`;
}

/**
 * Photo-led tier card: the tier's hero camera photo fills the whole card;
 * on hover it slides up to reveal a white panel underneath with the tier
 * name and price, plus two buttons over the photo — a quick-add, and a
 * "view list" that previews what's in the tier before it's added.
 */
function TierLink({ pkg, tier }: { pkg: ChooserPackage; tier: ChooserTier }) {
  const { addItem, openDrawer } = useKit();
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const addHover = useElasticHoverScale(addButtonRef, 1.15);
  const listButtonRef = React.useRef<HTMLButtonElement>(null);
  const listHover = useElasticHoverScale(listButtonRef, 1.15);
  const [listOpen, setListOpen] = React.useState(false);

  function addTierToKit() {
    tier.items.forEach((item) => {
      addItem(item.productSlug, item.quantity, {
        silent: true,
        packageSlug: pkg.slug,
        packageTierSlug: tier.slug,
      });
    });
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addTierToKit();
    openDrawer();
  }

  function handleOpenList(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setListOpen(true);
  }

  const resolvedItems = tier.items
    .map((item) => ({ item, product: getProductBySlug(item.productSlug) }))
    .filter((l): l is { item: (typeof tier.items)[number]; product: NonNullable<ReturnType<typeof getProductBySlug>> } =>
      Boolean(l.product)
    );

  return (
    <>
      <Link
        href={`/packages/${pkg.slug}?tier=${tier.slug}`}
        aria-label={`Explore the ${pkg.name} ${tier.label} package`}
        className="group relative block h-80 overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl sm:h-96"
      >
        {/* Name + price panel, always present but fully covered by the photo
            until hover slides the photo up to reveal it. */}
        <div className="absolute inset-x-0 bottom-0 z-0 flex h-24 flex-col justify-center bg-brand px-5 sm:h-28 sm:px-6">
          <p className="font-heading text-xl font-extrabold tracking-wide text-white uppercase sm:text-2xl">
            {tier.label}
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 font-mono text-lg font-bold text-white sm:text-xl">
            {tier.fullAmount ? (
              <span className="text-sm text-white/70 line-through decoration-2 sm:text-base">
                {formatGhc(tier.fullAmount, tier.currency)}
              </span>
            ) : null}
            <span>
              {formatGhc(tier.amount, tier.currency)} <span className="text-white/80">/day</span>
            </span>
          </p>
        </div>

        <div className="absolute inset-0 z-10 transition-transform duration-500 ease-[var(--ease-outta)] group-hover:-translate-y-24 sm:group-hover:-translate-y-28">
          <MediaPlaceholder
            src={tier.imageUrl}
            alt={`${tier.label} package`}
            fit="contain"
            className="absolute inset-0 h-full w-full"
          />
          {/* Visible by default so visitors know the price is hidden until
              hover — fades out the moment the photo starts sliding up.
              Desktop/mouse only: touch devices don't have a meaningful
              "hover", and the mobile slide carousel reuses this card. */}
          <span className="absolute inset-x-0 bottom-3 z-10 hidden justify-center opacity-100 transition-opacity duration-200 group-hover:opacity-0 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/70 px-3 py-1.5 text-xs font-medium text-background backdrop-blur-sm">
              <MousePointerClick className="size-3.5" strokeWidth={2} />
              Hover for price
            </span>
          </span>
        </div>

        <div className="absolute top-[38%] left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            ref={listButtonRef}
            type="button"
            aria-label={`See what's in the ${tier.label} package`}
            onClick={handleOpenList}
            onMouseEnter={listHover.onMouseEnter}
            onMouseLeave={listHover.onMouseLeave}
            className="flex size-12 items-center justify-center rounded-full bg-white text-foreground shadow-lg"
          >
            <List className="size-5" strokeWidth={2.25} />
          </button>
          <button
            ref={addButtonRef}
            type="button"
            aria-label={`Quick-add the ${tier.label} package to your kit`}
            onClick={handleQuickAdd}
            onMouseEnter={addHover.onMouseEnter}
            onMouseLeave={addHover.onMouseLeave}
            className="flex size-12 items-center justify-center rounded-full bg-white text-foreground shadow-lg"
          >
            <Plus className="size-5" strokeWidth={2.25} />
          </button>
        </div>
      </Link>

      <Modal
        open={listOpen}
        onOpenChange={setListOpen}
        title={`${tier.label} — What's Included`}
        description={`${formatGhc(tier.amount, tier.currency)}/day, before anything's added to your kit.`}
        footer={
          <Button
            onClick={() => {
              addTierToKit();
              setListOpen(false);
              openDrawer();
            }}
          >
            <Plus /> Add Package to Kit
          </Button>
        }
      >
        <ul className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          {resolvedItems.map(({ item, product }, i) => (
            <li key={`${item.productSlug}-${i}`} className="flex items-center gap-3">
              <MediaPlaceholder
                src={product.images?.[0]?.url ?? getProductImage(product.slug)}
                alt={product.name}
                fit="contain"
                className="size-12 shrink-0 rounded-lg border border-border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-small">{item.role}</p>
              </div>
              <div className="shrink-0 text-right">
                {item.quantity > 1 ? <p className="font-mono text-sm">×{item.quantity}</p> : null}
                <p className="text-small font-mono whitespace-nowrap">
                  {formatPrice(item.dayRate ?? product.dayRate, product.currency)}/day
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

/** Phone layout: the tier cards slide sideways, one per screen, with dot indicators. */
function TierSlides({ pkg }: { pkg: ChooserPackage }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const activeSlide = useSlideIndex(ref, pkg.tiers.length);

  return (
    <div className="mt-8 sm:hidden">
      <div
        ref={ref}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {pkg.tiers.map((tier) => (
          <div key={tier.slug} className="w-full shrink-0 snap-center">
            <TierLink pkg={pkg} tier={tier} />
          </div>
        ))}
      </div>
      <SlideIndicators
        count={pkg.tiers.length}
        active={activeSlide}
        onSelect={(i) => scrollToSlide(ref, i)}
        className="mt-4"
      />
    </div>
  );
}

/**
 * "Choose your production package": tabs for each package type, then one
 * card per tier with its starting day rate and a link into that tier.
 */
function PackageChooser({ packages }: { packages: ChooserPackage[] }) {
  const [activeSlug, setActiveSlug] = React.useState(packages[0]?.slug);
  const active = packages.find((p) => p.slug === activeSlug) ?? packages[0];
  if (!active) return null;

  return (
    <div>
      <div
        className="flex flex-wrap justify-center gap-2 sm:gap-3"
        role="tablist"
        aria-label="Production package"
      >
        {packages.map((pkg) => (
          <button
            key={pkg.slug}
            type="button"
            role="tab"
            aria-selected={pkg.slug === active.slug}
            onClick={() => setActiveSlug(pkg.slug)}
            className={cn(
              "rounded-full border-2 px-5 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors sm:text-base",
              pkg.slug === active.slug
                ? "border-brand bg-brand text-brand-foreground shadow-md"
                : "border-foreground/30 text-foreground hover:border-foreground"
            )}
          >
            {pkg.name}
          </button>
        ))}
      </div>

      {/* Phones: swipe sideways one card at a time. Larger screens: a grid. */}
      <TierSlides key={active.slug} pkg={active} />

      <div
        className={cn(
          "mx-auto mt-10 hidden gap-5 sm:grid",
          active.tiers.length >= 3 ? "max-w-5xl sm:grid-cols-3" : "max-w-3xl sm:grid-cols-2"
        )}
      >
        {active.tiers.map((tier) => (
          <TierLink key={tier.slug} pkg={active} tier={tier} />
        ))}
      </div>
    </div>
  );
}

export { PackageChooser };

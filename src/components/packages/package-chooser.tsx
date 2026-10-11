"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
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
 * name and price, plus a quick-add button over the photo.
 */
function TierLink({ pkg, tier }: { pkg: ChooserPackage; tier: ChooserTier }) {
  const { addItem, openDrawer } = useKit();
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const addHover = useElasticHoverScale(addButtonRef, 1.15);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    tier.items.forEach((item) => {
      addItem(item.productSlug, item.quantity, {
        silent: true,
        packageSlug: pkg.slug,
        packageTierSlug: tier.slug,
      });
    });
    openDrawer();
  }

  return (
    <Link
      href={`/packages/${pkg.slug}?tier=${tier.slug}`}
      aria-label={`Explore the ${pkg.name} ${tier.label} package`}
      className="group relative block h-80 overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl sm:h-96"
    >
      {/* Name + price panel, always present but fully covered by the photo
          until hover slides the photo up to reveal it. */}
      <div className="absolute inset-x-0 bottom-0 z-0 flex h-24 flex-col justify-center bg-card px-5 sm:h-28 sm:px-6">
        <p className="font-heading text-xl font-extrabold tracking-wide uppercase sm:text-2xl">
          {tier.label}
        </p>
        <p className="text-small mt-1 font-mono">
          {formatGhc(tier.amount, tier.currency)} <span className="text-muted-foreground">/day</span>
        </p>
      </div>

      <div className="absolute inset-0 z-10 transition-transform duration-500 ease-[var(--ease-outta)] group-hover:-translate-y-24 sm:group-hover:-translate-y-28">
        <MediaPlaceholder
          src={tier.imageUrl}
          alt={`${tier.label} package`}
          fit="cover"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <button
        ref={addButtonRef}
        type="button"
        aria-label={`Quick-add the ${tier.label} package to your kit`}
        onClick={handleQuickAdd}
        onMouseEnter={addHover.onMouseEnter}
        onMouseLeave={addHover.onMouseLeave}
        className="absolute top-[38%] left-1/2 z-20 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
      >
        <Plus className="size-5" strokeWidth={2.25} />
      </button>
    </Link>
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

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getTierCopy } from "@/lib/packages/tier-copy";
import type { ChooserPackage } from "@/lib/packages/chooser";

/** Short card line for each kind of tier (Commercial's "TOP BOY" is the TOP GUY tier). */
const CARD_BLURBS: Record<string, string> = {
  lite: "Essential gear for lean productions.",
  "top-guy": "A more complete professional setup.",
  yolo: "For productions that want to go all out.",
};
const BLURB_ALIASES: Record<string, string> = { "top-boy-mid": "top-guy" };

function formatGhc(amount: number, currency: string): string {
  const figure = amount.toLocaleString("en-GB");
  return currency === "GHS" ? `GHC ${figure}` : `${currency} ${figure}`;
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

      <div
        className={cn(
          "mx-auto mt-8 grid gap-4 sm:mt-10 sm:gap-5",
          active.tiers.length >= 3 ? "max-w-5xl sm:grid-cols-3" : "max-w-3xl sm:grid-cols-2"
        )}
      >
        {active.tiers.map((tier, i) => {
          const key = BLURB_ALIASES[tier.slug] ?? tier.slug;
          const dark = i === 1;
          const brand = i >= 2;
          return (
            <Link
              key={tier.slug}
              href={`/packages/${active.slug}?tier=${tier.slug}`}
              aria-label={`Explore the ${active.name} ${tier.label} package`}
              className={cn(
                "group flex flex-col rounded-2xl border-2 p-6 transition-transform active:scale-[0.99] sm:p-7",
                dark && "border-foreground bg-foreground text-background",
                brand && "border-brand bg-brand text-brand-foreground",
                !dark && !brand && "border-foreground/30 bg-card text-foreground hover:border-foreground"
              )}
            >
              <p className="font-heading text-3xl font-extrabold tracking-wide uppercase sm:text-4xl">
                {tier.label}
              </p>
              <p className="mt-1 text-sm font-semibold opacity-80">
                {getTierCopy(tier.slug)?.title}
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-widest uppercase opacity-70">
                  Starting from
                </p>
                <p className="mt-1 font-mono text-2xl font-bold sm:text-3xl">
                  {formatGhc(tier.amount, tier.currency)}
                  <span className="text-sm font-medium opacity-70"> /day</span>
                </p>
              </div>

              <p className="mt-4 text-base font-medium opacity-90">{CARD_BLURBS[key]}</p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
                Explore Packages
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export { PackageChooser };

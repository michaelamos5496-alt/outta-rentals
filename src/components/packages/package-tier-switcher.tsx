"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { PackageBuilder } from "@/components/packages/package-builder";
import type { PackageTier } from "@/lib/packages/types";

export interface PackageTierSwitcherProps {
  tiers: PackageTier[];
}

/**
 * Tabs between a package's tiers (e.g. LITE / YOLO) — each tier is a
 * separately quoted bundle with its own gear and flat rate, so switching
 * tabs swaps both the item list and the price shown, and resets any
 * customization the customer made to the previous tier.
 */
function PackageTierSwitcher({ tiers }: PackageTierSwitcherProps) {
  const [activeSlug, setActiveSlug] = React.useState(tiers[0].slug);
  const active = tiers.find((t) => t.slug === activeSlug) ?? tiers[0];

  return (
    <div>
      {tiers.length > 1 ? (
        <div className="mb-6 flex gap-2" role="tablist" aria-label="Package tier">
          {tiers.map((tier) => (
            <button
              key={tier.slug}
              type="button"
              role="tab"
              aria-selected={tier.slug === activeSlug}
              onClick={() => setActiveSlug(tier.slug)}
              className={cn(
                "flex flex-1 flex-col items-start gap-0.5 border px-4 py-3 text-left transition-colors",
                tier.slug === activeSlug
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span className="text-label">{tier.label}</span>
              {tier.price && tier.currency ? (
                <span className="font-mono text-sm font-semibold">
                  {formatPrice(tier.price, tier.currency)}/day
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <PackageBuilder
        key={active.slug}
        items={active.items}
        quotedPrice={
          typeof active.price === "number" && active.currency
            ? { amount: active.price, currency: active.currency }
            : undefined
        }
      />
    </div>
  );
}

export { PackageTierSwitcher };

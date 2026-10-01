import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PackageEquipmentGrid } from "@/components/packages/package-equipment-grid";
import { getAllPackages, getTierTotal } from "@/lib/packages";
import { formatTotal } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Production Packages",
  description:
    "Preset equipment packages for commercial and documentary shoots — customizable before you add them to your kit.",
};

export default function PackagesPage() {
  // One card per tier, not per package — Commercial's TOP BOY and YOLO
  // each get their own card (gear + price), with the package name kept as
  // a small label on the card so it's still clear they're both Commercial.
  const tierCards = getAllPackages().flatMap((pkg) =>
    pkg.tiers.map((tier) => ({ pkg, tier }))
  );

  return (
    <Section className="pt-16 sm:pt-20">
      <div className="text-center">
        <Heading level="display" eyebrow="Packages">
          Build your kit.
        </Heading>
        <p className="text-body mx-auto mt-6 max-w-xl">
          Preset production packages, put together the way an experienced
          rental technician would start — adjust anything before it goes into
          your kit.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
        {tierCards.map(({ pkg, tier }) => {
          const rates = getTierTotal(tier);
          const href = `/packages/${pkg.slug}?tier=${tier.slug}`;

          return (
            <article
              key={`${pkg.slug}-${tier.slug}`}
              className="group/pkg relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand"
            >
              <Link href={href} className="flex flex-1 flex-col active:opacity-80">
                <div className="flex items-start justify-between gap-2 p-2.5 pb-1 sm:p-3 sm:pb-1">
                  <div className="min-w-0">
                    <p className="text-[0.625rem] leading-tight font-semibold tracking-wide text-brand-foreground/70 uppercase">
                      {pkg.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.8125rem] leading-none font-bold text-brand-foreground">
                      {tier.label}
                    </p>
                    {rates.length > 0 ? (
                      <p className="mt-1 font-mono text-[0.75rem] leading-none font-semibold text-brand-foreground/90">
                        {formatTotal(rates)}/day
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="relative mt-1 min-h-[7rem] flex-1">
                  <PackageEquipmentGrid
                    items={tier.items}
                    className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/pkg:scale-105"
                  />
                </div>
              </Link>

              <Link
                href={href}
                aria-label={`View ${pkg.name} ${tier.label} package`}
                className="bg-white text-foreground absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full transition-transform active:scale-90"
              >
                <ArrowUpRight className="size-3.5" />
              </Link>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

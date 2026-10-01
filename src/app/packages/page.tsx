import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PackageEquipmentGrid } from "@/components/packages/package-equipment-grid";
import { getAllPackages, getTierTotal, type PackageTier, type ProductionPackage } from "@/lib/packages";
import { formatTotal } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Production Packages",
  description:
    "Preset equipment packages for commercial and documentary shoots — customizable before you add them to your kit.",
};

function TierCard({ pkg, tier }: { pkg: ProductionPackage; tier: PackageTier }) {
  const rates = getTierTotal(tier);
  const href = `/packages/${pkg.slug}?tier=${tier.slug}`;

  return (
    <article className="group/pkg relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand">
      <Link href={href} className="flex flex-1 flex-col active:opacity-80">
        <div className="flex items-start justify-between gap-2 p-2.5 pb-1 sm:p-3 sm:pb-1">
          <div className="min-w-0">
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
}

export default function PackagesPage() {
  const packages = getAllPackages();

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

      {/* A 4-column table: one column per package, its tiers stacked inside
          it, a rule between columns at desktop — reads as a comparison
          table across packages instead of a long vertical scroll. Stacks
          to 1-2 columns below lg, where a side-by-side table doesn't fit. */}
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-border">
        {packages.map((pkg) => (
          <div key={pkg.slug} className="flex flex-col lg:px-6 lg:first:pl-0 lg:last:pr-0">
            <h2 className="text-h3">{pkg.name}</h2>
            <p className="text-small mt-1 text-muted-foreground">{pkg.description}</p>

            <div className="mt-4 flex flex-col gap-3">
              {pkg.tiers.map((tier) => (
                <TierCard key={tier.slug} pkg={pkg} tier={tier} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

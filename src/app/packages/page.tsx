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

function PackageCell({ pkg }: { pkg: ProductionPackage }) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10 sm:py-12">
      <h2 className="text-h3">{pkg.name}</h2>
      <div className="grid w-full grid-cols-2 gap-3">
        {pkg.tiers.map((tier) => (
          <TierCard key={tier.slug} pkg={pkg} tier={tier} />
        ))}
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const packages = getAllPackages();
  // Two packages per row, so each row's own divide-x only lines up its own
  // pair — a plain divide-x/divide-y on one flat grid would also put a
  // vertical rule on the second row's left-hand cell, breaking the cross.
  const rows: ProductionPackage[][] = [];
  for (let i = 0; i < packages.length; i += 2) rows.push(packages.slice(i, i + 2));

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

      {/* A 2x2 grid with a full cross-divider — each quadrant is one
          package, its tiers side by side inside it. */}
      <div className="mt-12 divide-y divide-border border-t border-border">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-border">
            {row.map((pkg) => (
              <PackageCell key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

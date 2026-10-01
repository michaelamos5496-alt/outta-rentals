import type { Metadata } from "next";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { TierCard } from "@/components/packages/tier-flyer";
import { getAllPackages, type ProductionPackage } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Production Packages",
  description:
    "Preset equipment packages for commercial and documentary shoots — customizable before you add them to your kit.",
};

function PackageCell({ pkg }: { pkg: ProductionPackage }) {
  // Most packages have two tiers, but some (Commercial, Music Video) now
  // have three — the grid widens to fit instead of wrapping awkwardly.
  const tierGridCols = pkg.tiers.length >= 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10 sm:py-12">
      <h2 className="text-h3">{pkg.name}</h2>
      <div className={`grid w-full ${tierGridCols} gap-3`}>
        {pkg.tiers.map((tier, i) => (
          <TierCard key={tier.slug} pkg={pkg} tier={tier} premium={i === 0} />
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
          package, its tiers side by side inside it as mini flyers. */}
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

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { PackageEquipmentGrid } from "@/components/packages/package-equipment-grid";
import { getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { getAllPackages, getDefaultTier, getTierTotal } from "@/lib/packages";
import { themeImages } from "@/lib/editorial-images";
import { formatTotal } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Production Packages",
  description:
    "Preset equipment packages for commercial and documentary shoots — customizable before you add them to your kit.",
};

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

      <div className="mt-12 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
        {packages.map((pkg) => {
          const defaultTier = getDefaultTier(pkg);
          const heroItem = defaultTier.items.find((i) => i.role === "Camera") ?? defaultTier.items[0];
          const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
          const icon = getCategoryIcon(heroProduct?.categorySlug ?? "cameras");

          return (
            <article
              key={pkg.slug}
              className="group/pkg relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand"
            >
              <Link href={`/packages/${pkg.slug}`} className="flex flex-1 flex-col active:opacity-80">
                <div className="flex items-start justify-between gap-2 p-2.5 pb-1 sm:p-3 sm:pb-1">
                  <div className="min-w-0">
                    {/* Package name stays the clear identity ("Commercial");
                        every tier's own price is listed right under it —
                        both TOP BOY and YOLO at a glance, no click needed. */}
                    <p className="line-clamp-2 text-xs font-light leading-tight text-brand-foreground">
                      {pkg.name}
                    </p>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {pkg.tiers.map((tier) => {
                        const rates = getTierTotal(tier);
                        if (rates.length === 0) return null;
                        return (
                          <p
                            key={tier.slug}
                            className="font-mono text-[0.6875rem] leading-tight font-bold text-brand-foreground"
                          >
                            {tier.label}{" "}
                            <span className="font-normal opacity-80">{formatTotal(rates)}/day</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="relative mt-1 min-h-[7rem] flex-1">
                  {pkg.slug === "commercial" || pkg.slug === "documentary" ? (
                    <PackageEquipmentGrid
                      items={defaultTier.items}
                      className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/pkg:scale-105"
                    />
                  ) : (
                    <MediaPlaceholder
                      src={themeImages[pkg.slug]}
                      alt={pkg.name}
                      icon={icon}
                      className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/pkg:scale-105"
                    />
                  )}
                </div>
              </Link>

              <Link
                href={`/packages/${pkg.slug}`}
                aria-label={`View ${pkg.name} package`}
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

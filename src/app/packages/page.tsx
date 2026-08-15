import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { getAllPackages } from "@/lib/packages";
import { themeImages } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Production Packages",
  description:
    "Preset equipment packages for commercial, documentary, music video, wedding, feature film and live production shoots — customizable before you add them to your kit.",
};

export default function PackagesPage() {
  const packages = getAllPackages();

  return (
    <Section className="pt-16 sm:pt-20">
      <Heading level="display" eyebrow="Packages">
        Build your kit.
      </Heading>
      <p className="text-body mt-6 max-w-xl">
        Preset production packages, put together the way an experienced
        rental technician would start — adjust anything before it goes into
        your kit.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
        {packages.map((pkg) => {
          const heroItem = pkg.items.find((i) => i.role === "Camera") ?? pkg.items[0];
          const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
          const icon = getCategoryIcon(heroProduct?.categorySlug ?? "cameras");

          // Real total day rate for the package's line items — same "price
          // tag" pattern as the equipment cards, computed from real product
          // rates rather than invented.
          const dayRate = pkg.items.reduce((sum, item) => {
            const product = getProductBySlug(item.productSlug);
            return sum + (product ? product.dayRate * item.quantity : 0);
          }, 0);
          const currency = getProductBySlug(pkg.items[0]?.productSlug ?? "")?.currency ?? "GHS";

          return (
            <article
              key={pkg.slug}
              className="group/pkg relative flex h-full flex-col overflow-hidden rounded-2xl bg-brand"
            >
              <Link href={`/packages/${pkg.slug}`} className="flex flex-1 flex-col active:opacity-80">
                <div className="flex items-start justify-between gap-2 p-3 pb-1.5 sm:p-3.5 sm:pb-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold leading-tight text-brand-foreground">
                      {pkg.name}
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-brand-foreground/70">
                      {pkg.items.length} roles included
                    </p>
                  </div>
                  <p className="hidden max-w-[45%] text-right text-[0.625rem] leading-snug text-brand-foreground/70 sm:line-clamp-2 sm:block">
                    {pkg.description}
                  </p>
                </div>

                <div className="relative mt-1 min-h-[7rem] flex-1">
                  <MediaPlaceholder
                    src={themeImages[pkg.slug]}
                    alt={pkg.name}
                    icon={icon}
                    className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-outta)] group-hover/pkg:scale-105"
                  />
                  {dayRate > 0 ? (
                    <span className="absolute right-2 bottom-2 bg-background px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold">
                      From {formatPrice(dayRate, currency)}/day
                    </span>
                  ) : null}
                </div>
              </Link>

              <Link
                href={`/packages/${pkg.slug}`}
                aria-label={`View ${pkg.name} package`}
                className="bg-foreground text-background absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full transition-transform active:scale-90"
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

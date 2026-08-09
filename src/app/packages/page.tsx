import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { getAllPackages } from "@/lib/packages";
import { themeImages } from "@/lib/editorial-images";

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

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const heroItem = pkg.items.find((i) => i.role === "Camera") ?? pkg.items[0];
          const heroProduct = heroItem ? getProductBySlug(heroItem.productSlug) : undefined;
          const icon = getCategoryIcon(heroProduct?.categorySlug ?? "cameras");

          return (
            <div
              key={pkg.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-border"
            >
              <MediaPlaceholder
                src={themeImages[pkg.slug]}
                alt={pkg.name}
                icon={icon}
                className="aspect-square w-full"
              />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-medium">{pkg.name}</h3>
                <p className="text-small mt-1.5 flex-1">{pkg.description}</p>
                <p className="text-meta mt-3">{pkg.items.length} roles included</p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={`/packages/${pkg.slug}`}>View Package</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

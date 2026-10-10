import type { Metadata } from "next";

import { loadLiveCatalogue } from "@/lib/catalogue/live-server";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PackageChooser } from "@/components/packages/package-chooser";
import { toChooserData } from "@/lib/packages/chooser";
import { getAllPackages } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Production Packages",
  description:
    "Preset equipment packages for commercial and documentary shoots — customizable before you add them to your kit.",
};

export default async function PackagesPage() {
  await loadLiveCatalogue();
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
        <p className="mt-4 font-mono text-sm tracking-[0.08em] text-muted-foreground uppercase">
          20% Package Discount • All Rates in Ghana Cedis (GHC)
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-h3 mb-6 text-center tracking-wide uppercase">
          Choose your production package
        </h2>
        <PackageChooser packages={toChooserData(packages)} />
      </div>
    </Section>
  );
}

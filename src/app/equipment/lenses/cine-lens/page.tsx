import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { LensTypeTabs } from "@/components/catalogue/lens-type-tabs";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Cine Lens",
  description: "Cinema primes and zooms with geared, cine-style barrels for smooth focus pulls.",
};

export default async function CineLensPage() {
  const products = (await fetchProductsByCategory("lenses")).filter((p) => p.tags.includes("cine-lens"));
  return (
    <CatalogueView
      products={products}
      lockedCategory="lenses"
      title="Cine Lens"
      description="Cinema primes and zooms with geared, cine-style barrels for smooth focus pulls."
      subNav={<LensTypeTabs active="cine" />}
    />
  );
}

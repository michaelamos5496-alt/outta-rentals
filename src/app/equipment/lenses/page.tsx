import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { LensTypeTabs } from "@/components/catalogue/lens-type-tabs";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Lenses",
  description: "Cine and photo lenses — primes, zooms and specialty glass.",
};

export default async function LensesPage() {
  const products = await fetchProductsByCategory("lenses");
  return (
    <CatalogueView
      products={products}
      lockedCategory="lenses"
      description="Cine and photo lenses — primes, zooms and specialty glass."
      subNav={<LensTypeTabs active="all" />}
    />
  );
}

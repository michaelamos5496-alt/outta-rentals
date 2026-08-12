import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Filters",
  description: "ND, diffusion and polarizing filters.",
};

export default async function FiltersPage() {
  const products = await fetchProductsByCategory("filters");
  return <CatalogueView products={products} lockedCategory="filters" />;
}

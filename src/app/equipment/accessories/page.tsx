import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Accessories",
  description: "Power, media, filtration and cabling.",
};

export default async function AccessoriesPage() {
  const products = await fetchProductsByCategory("accessories");
  return <CatalogueView products={products} lockedCategory="accessories" />;
}

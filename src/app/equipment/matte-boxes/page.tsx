import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Matte Boxes",
  description: "Lens shading and filter-mounting systems.",
};

export default async function MatteBoxesPage() {
  const products = await fetchProductsByCategory("matte-boxes");
  return <CatalogueView products={products} lockedCategory="matte-boxes" />;
}

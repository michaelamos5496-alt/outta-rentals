import type { Metadata } from "next";

import { fetchAllProducts } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Equipment",
};

export default async function EquipmentPage() {
  const products = await fetchAllProducts();
  return <CatalogueView products={products} />;
}

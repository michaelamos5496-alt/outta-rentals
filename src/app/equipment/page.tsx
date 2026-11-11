import type { Metadata } from "next";

import { fetchAllProducts } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Equipment",
  description:
    "Browse the full OUTTA RENTALS catalogue — cameras, lenses, lighting, grip, audio, monitors, filters and matte boxes for professional productions.",
};

export default async function EquipmentPage() {
  const products = await fetchAllProducts();
  return <CatalogueView products={products} />;
}

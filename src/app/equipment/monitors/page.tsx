import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Monitors",
  description: "On-camera and production monitoring.",
};

export default async function MonitorsPage() {
  const products = await fetchProductsByCategory("monitors");
  return <CatalogueView products={products} lockedCategory="monitors" />;
}

import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Lighting",
  description: "LED, HMI and tungsten fixtures for any setup.",
};

export default async function LightingPage() {
  const products = await fetchProductsByCategory("lighting");
  return <CatalogueView products={products} lockedCategory="lighting" />;
}

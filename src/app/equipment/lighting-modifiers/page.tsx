import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Lighting Modifiers",
  description: "Bounce, diffusion, flags and grip for lighting.",
};

export default async function LightingModifiersPage() {
  const products = await fetchProductsByCategory("lighting-modifiers");
  return <CatalogueView products={products} lockedCategory="lighting-modifiers" />;
}

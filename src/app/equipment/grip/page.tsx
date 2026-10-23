import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Grip",
  description: "Tripods, gimbals, jibs, sliders, stands and camera support.",
};

export default async function GripPage() {
  const products = await fetchProductsByCategory("grip");
  return <CatalogueView products={products} lockedCategory="grip" />;
}

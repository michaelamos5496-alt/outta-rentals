import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 86400; // daily safety net — admin edits refresh it straight away (see revalidateStorefront)

export const metadata: Metadata = {
  title: "Audio",
  description: "Wireless mics, boom and field recording gear.",
};

export default async function AudioPage() {
  const products = await fetchProductsByCategory("audio");
  return <CatalogueView products={products} lockedCategory="audio" />;
}

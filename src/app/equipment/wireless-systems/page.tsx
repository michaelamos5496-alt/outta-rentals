import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Wireless Systems",
  description: "Wireless video transmitters, receivers and monitoring links.",
};

export default async function WirelessSystemsPage() {
  const products = await fetchProductsByCategory("wireless-systems");
  return <CatalogueView products={products} lockedCategory="wireless-systems" />;
}

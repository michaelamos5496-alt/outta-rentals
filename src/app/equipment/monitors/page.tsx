import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Monitors",
  description: "On-camera and production monitoring.",
};

export default async function MonitorsPage() {
  const products = await fetchProductsByCategory("monitors");
  return <CatalogueView products={products} lockedCategory="monitors" />;
}

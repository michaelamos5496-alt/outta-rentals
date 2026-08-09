import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Drones",
  description: "Aerial camera platforms and accessories.",
};

export default async function DronesPage() {
  const products = await fetchProductsByCategory("drones");
  return <CatalogueView products={products} lockedCategory="drones" />;
}

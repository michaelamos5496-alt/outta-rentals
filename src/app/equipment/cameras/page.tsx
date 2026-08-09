import type { Metadata } from "next";

import { fetchProductsByCategory } from "@/lib/catalogue/db";
import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

export const metadata: Metadata = {
  title: "Cameras",
  description: "Cinema and mirrorless camera bodies for every production scale.",
};

export default async function CamerasPage() {
  const products = await fetchProductsByCategory("cameras");
  return <CatalogueView products={products} lockedCategory="cameras" />;
}

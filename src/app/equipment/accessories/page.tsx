import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Accessories",
};

export default function AccessoriesPage() {
  return <CatalogueView lockedCategory="accessories" />;
}

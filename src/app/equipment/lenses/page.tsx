import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Lenses",
};

export default function LensesPage() {
  return <CatalogueView lockedCategory="lenses" />;
}

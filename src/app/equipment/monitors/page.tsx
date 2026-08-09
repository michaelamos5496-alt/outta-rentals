import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Monitors",
};

export default function MonitorsPage() {
  return <CatalogueView lockedCategory="monitors" />;
}

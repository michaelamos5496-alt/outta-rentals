import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Lighting",
};

export default function LightingPage() {
  return <CatalogueView lockedCategory="lighting" />;
}

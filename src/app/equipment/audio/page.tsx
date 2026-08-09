import type { Metadata } from "next";

import { CatalogueView } from "@/components/catalogue/catalogue-view";

export const metadata: Metadata = {
  title: "Audio",
};

export default function AudioPage() {
  return <CatalogueView lockedCategory="audio" />;
}

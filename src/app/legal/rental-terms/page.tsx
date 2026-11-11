import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { rentalTerms } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Rental Terms",
  description: "Deposits, damage, cancellations and the other terms that apply to every OUTTA RENTALS booking.",
};

export default function RentalTermsPage() {
  return <LegalPage document={rentalTerms} />;
}

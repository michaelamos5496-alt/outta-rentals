import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { termsOfService } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of the OUTTA RENTALS website and services.",
};

export default function TermsPage() {
  return <LegalPage document={termsOfService} />;
}

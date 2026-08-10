import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { privacyPolicy } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OUTTA RENTALS collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return <LegalPage document={privacyPolicy} />;
}

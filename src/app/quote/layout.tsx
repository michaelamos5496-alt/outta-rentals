import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Turn your kit into a quote request with OUTTA RENTALS.",
  robots: { index: false, follow: true },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}

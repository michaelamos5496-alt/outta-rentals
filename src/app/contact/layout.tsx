import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with OUTTA RENTALS about equipment availability, a custom kit, or a production you're planning.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { KitProvider } from "@/components/kit/kit-provider";
import { KitDrawer } from "@/components/kit/kit-drawer";
import { FloatingKitButton } from "@/components/kit/floating-kit-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OUTTA RENTALS — Professional Production Equipment",
    template: "%s — OUTTA RENTALS",
  },
  description:
    "OUTTA RENTALS is a premium film, photography and production-equipment rental company.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <KitProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <KitDrawer />
          <FloatingKitButton />
        </KitProvider>
      </body>
    </html>
  );
}

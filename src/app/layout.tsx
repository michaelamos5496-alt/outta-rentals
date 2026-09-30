import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { KitProvider } from "@/components/kit/kit-provider";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { siteConfig } from "@/config/site";

// One typeface sitewide — body copy, UI, mono-style figures and headings
// all render in Montserrat (at different weights), instead of the
// previous three-family split (Geist Sans/Mono + Space Grotesk).
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Professional Production Equipment`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    // /favicon.ico is picked up automatically from src/app/favicon.ico.
    icon: [{ url: "/brand/outta-favicon.png", type: "image/png", sizes: "512x512" }],
    apple: "/brand/outta-apple-touch.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Professional Production Equipment`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Professional Production Equipment`,
    description: SITE_DESCRIPTION,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  sameAs: [siteConfig.instagramUrl],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <KitProvider>
          <SiteChrome>{children}</SiteChrome>
        </KitProvider>
      </body>
    </html>
  );
}

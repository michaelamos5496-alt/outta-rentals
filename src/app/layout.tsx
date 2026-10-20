import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { KitProvider } from "@/components/kit/kit-provider";
import { LiveCatalogue } from "@/components/catalogue/live-catalogue";
import { loadLiveCatalogue } from "@/lib/catalogue/live-server";
import { LivePackages } from "@/components/packages/live-packages";
import { loadLivePackages } from "@/lib/packages/live-server";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Analytics } from "@vercel/analytics/next";

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

// Re-read prices/names/photos from the database at most once a minute.
export const revalidate = 60;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const liveCatalogue = await loadLiveCatalogue();
  const livePackages = await loadLivePackages();
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
        <LiveCatalogue items={liveCatalogue} />
        <LivePackages rows={livePackages} />
        <KitProvider>
          <SiteChrome>{children}</SiteChrome>
        </KitProvider>
        <Analytics />
      </body>
    </html>
  );
}

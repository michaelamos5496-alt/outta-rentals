/**
 * Falls back to the Vercel-provided URL, then localhost, so metadataBase is
 * always valid even before NEXT_PUBLIC_SITE_URL is set for production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  // Vercel: prefer the stable production domain over the per-deployment URL.
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "OUTTA RENTALS";

export const SITE_DESCRIPTION =
  "Camera rental in Accra, Ghana. OUTTA RENTALS hires out cinema cameras, cine lenses, lighting, grip and audio for film, photo and video productions — with delivery and collection across Accra.";

export const SITE_TITLE = `${SITE_NAME} — Camera & Film Equipment Rental in Accra, Ghana`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

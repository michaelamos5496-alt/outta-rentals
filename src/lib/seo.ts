/**
 * Falls back to the Vercel-provided URL, then localhost, so metadataBase is
 * always valid even before NEXT_PUBLIC_SITE_URL is set for production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "OUTTA RENTALS";

export const SITE_DESCRIPTION =
  "OUTTA RENTALS is a premium film, photography and production-equipment rental company — cameras, lenses, lighting, audio, grip and drones for serious productions.";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

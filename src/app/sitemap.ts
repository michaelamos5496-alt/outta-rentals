import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";
import { categorySlugs } from "@/lib/catalogue/categories";
import { fetchAllProducts } from "@/lib/catalogue/db";
import { packages } from "@/lib/packages/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/equipment`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/packages`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/work`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/equipment/${slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/equipment/${product.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg) => ({
    url: `${SITE_URL}/packages/${pkg.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...packageRoutes];
}

import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clapperboard } from "lucide-react";

import {
  getAccessoryProducts,
  getBrandBySlug,
  getCategoryBySlug,
  getCompatibleProducts,
  getRelatedProducts,
  availabilityLabels,
  availabilityVariant,
  type DemoProductSpec,
} from "@/lib/catalogue";
import { fetchProductBySlug } from "@/lib/catalogue/db";
import { getRecommendedForShoot } from "@/lib/packages";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { workProjects } from "@/lib/content/work";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/catalogue/product-gallery";
import { ProductActions } from "@/components/catalogue/product-actions";
import { ProductShelf } from "@/components/catalogue/product-shelf";
import { MobileStickyRent } from "@/components/catalogue/mobile-sticky-rent";
import { formatPrice } from "@/lib/currency";

export const revalidate = 60; // seconds — keep inventory reasonably fresh once a real DB is connected

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Equipment Not Found" };

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/equipment/${product.slug}` },
    openGraph: {
      title: `${product.name} — ${SITE_NAME}`,
      description: product.shortDescription,
      url: `/equipment/${product.slug}`,
      type: "website",
    },
  };
}

function groupSpecifications(specs: DemoProductSpec[]) {
  const groups: { group: string; specs: DemoProductSpec[] }[] = [];
  for (const spec of specs) {
    const groupName = spec.group ?? "General";
    let group = groups.find((g) => g.group === groupName);
    if (!group) {
      group = { group: groupName, specs: [] };
      groups.push(group);
    }
    group.specs.push(spec);
  }
  return groups;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Equipment not found"
          description={`We couldn't find equipment matching "${slug}". It may have been renamed or is no longer listed.`}
          action={
            <Button asChild variant="outline">
              <Link href="/equipment">Browse all equipment</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const brand = getBrandBySlug(product.brandSlug);
  const category = getCategoryBySlug(product.categorySlug);
  const specGroups = groupSpecifications(product.specifications);
  const compatible = getCompatibleProducts(product);
  const accessories = getAccessoryProducts(product);
  const alreadyShown = new Set([...compatible, ...accessories].map((p) => p.slug));
  const recommendedForShoot = getRecommendedForShoot(product).filter(
    (p) => !alreadyShown.has(p.slug)
  );
  const related = getRelatedProducts(product);
  const shotWithThis = workProjects.find((p) =>
    p.equipmentUsed.some((e) => e.productSlug === product.slug)
  );

  const schemaAvailability: Record<string, string> = {
    available: "https://schema.org/InStock",
    reserved: "https://schema.org/LimitedAvailability",
    coming_soon: "https://schema.org/PreOrder",
    maintenance: "https://schema.org/OutOfStock",
    unavailable: "https://schema.org/OutOfStock",
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: brand?.name ?? product.brandSlug },
    sku: product.sku,
    url: absoluteUrl(`/equipment/${product.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.dayRate,
      availability: schemaAvailability[product.availability] ?? "https://schema.org/OutOfStock",
      url: absoluteUrl(`/equipment/${product.slug}`),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Equipment", item: absoluteUrl("/equipment") },
      {
        "@type": "ListItem",
        position: 2,
        name: category?.name ?? product.categorySlug,
        item: absoluteUrl(`/equipment/${product.categorySlug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(`/equipment/${product.slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container className="py-10 pb-28 sm:py-14 lg:pb-14">
        <p className="text-small mb-6">
          <Link href="/equipment" className="hover:text-foreground">
            Equipment
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <Link href={`/equipment/${product.categorySlug}`} className="hover:text-foreground">
            {category?.name ?? product.categorySlug}
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">{product.name}</span>
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            productSlug={product.slug}
            categorySlug={product.categorySlug}
            sku={product.sku}
            name={product.name}
          />

          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-label text-brand">{brand?.name ?? product.brandSlug}</p>
                <h1 className="text-h1 mt-2">{product.name}</h1>
              </div>
              <Badge variant={availabilityVariant[product.availability]} className="shrink-0">
                {availabilityLabels[product.availability]}
              </Badge>
            </div>

            <p className="text-body mt-4">{product.description}</p>

            <div className="mt-6 flex items-baseline gap-6 rounded-xl border border-border p-5">
              <div>
                <p className="text-meta">Daily rate</p>
                <p className="text-h3 mt-1 font-mono">
                  {formatPrice(product.dayRate, product.currency)}
                  <span className="font-sans text-sm font-normal text-muted-foreground"> / day</span>
                </p>
              </div>
              <Divider orientation="vertical" className="h-10" />
              <div>
                <p className="text-meta">Weekly rate</p>
                <p className="text-h3 mt-1 font-mono">
                  {formatPrice(product.weekRate, product.currency)}
                  <span className="font-sans text-sm font-normal text-muted-foreground"> / week</span>
                </p>
              </div>
            </div>
            <p className="text-small mt-2">
              Rates shown are OUTTA&rsquo;s real rates, confirmed at quote stage.
            </p>

            <div className="mt-6 hidden lg:block">
              <ProductActions productSlug={product.slug} productName={product.name} />
            </div>

            {shotWithThis ? (
              <Link
                href={`/work#${shotWithThis.slug}`}
                className="mt-6 flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand lg:hidden"
              >
                <Clapperboard className="size-8 shrink-0 text-brand" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-label text-brand">Shot With This Gear</p>
                  <p className="mt-0.5 truncate text-sm font-medium">{shotWithThis.title}</p>
                </div>
              </Link>
            ) : null}

            {product.included.length > 0 ? (
              <div className="mt-8">
                <p className="text-label mb-3">What&rsquo;s included</p>
                <ul className="flex flex-col gap-2">
                  {product.included.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <Check className="size-4 shrink-0 text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {specGroups.length > 0 ? (
          <div className="mt-16 border-t border-border pt-14 sm:mt-20 sm:pt-16">
            <p className="text-label mb-8">Specifications</p>

            {/* Desktop: always-expanded grid, unchanged. */}
            <div className="hidden grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid">
              {specGroups.map((group) => (
                <div key={group.group}>
                  <p className="text-sm font-medium">{group.group}</p>
                  <dl className="mt-3 flex flex-col">
                    {group.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 text-sm"
                      >
                        <dt className="text-muted-foreground">{spec.label}</dt>
                        <dd className="text-right">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            {/* Mobile: collapsible per group so the page doesn't dump a wall
                of specs before the shelves below. */}
            <div className="flex flex-col divide-y divide-border lg:hidden">
              {specGroups.map((group) => (
                <details key={group.group} className="group py-4 first:pt-0">
                  <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                    <span className="flex items-center justify-between">
                      {group.group}
                      <span className="text-muted-foreground transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <dl className="mt-3 flex flex-col">
                    {group.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 text-sm"
                      >
                        <dt className="text-muted-foreground">{spec.label}</dt>
                        <dd className="text-right">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          </div>
        ) : null}
      </Container>

      <MobileStickyRent
        productSlug={product.slug}
        dayRate={product.dayRate}
        currency={product.currency}
      />

      <Container>
        <ProductShelf
          title="You may also need"
          eyebrow="Complete The Kit"
          products={accessories}
        />
        <ProductShelf
          title="Compatible with"
          eyebrow="Works With"
          products={compatible}
        />
        <ProductShelf
          title="Recommended for your shoot"
          eyebrow="From Our Preset Packages"
          products={recommendedForShoot}
        />
        <ProductShelf title="Related products" eyebrow="More Like This" products={related} />
      </Container>
    </>
  );
}

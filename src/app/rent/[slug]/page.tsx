import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { getRentPage, rentPages } from "@/lib/content/rent-pages";
import { absoluteUrl } from "@/lib/seo";

interface RentPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return rentPages.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: RentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getRentPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: `/rent/${page.slug}` },
  };
}

export default async function RentLandingPage({ params }: RentPageProps) {
  const { slug } = await params;
  const page = getRentPage(slug);
  if (!page) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: page.title, item: absoluteUrl(`/rent/${page.slug}`) },
    ],
  };

  return (
    <Section className="pt-16 pb-24 sm:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-2xl">
        <Heading level="display" eyebrow="Accra, Ghana">
          {page.title}
        </Heading>
        <p className="text-body mt-6">{page.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="uppercase tracking-wide">
            <Link href={page.categoryHref}>{page.categoryLabel}</Link>
          </Button>
          <WhatsAppButton
            label="Ask on WhatsApp"
            heading={`Hi OUTTA RENTALS — I'd like to enquire about: ${page.title.toLowerCase()}.`}
            closingLine="Thanks!"
            size="lg"
            variant="outline"
            className="uppercase tracking-wide"
          />
        </div>
      </div>

      <Divider className="my-12" />

      <div className="grid max-w-4xl gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-h3">What you get</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {page.points.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-h3">Questions</h2>
          <dl className="mt-5 flex flex-col gap-5">
            {page.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold">{f.q}</dt>
                <dd className="text-small mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Divider className="my-12" />

      <p className="text-small">
        More:{" "}
        {rentPages
          .filter((p) => p.slug !== page.slug)
          .map((p, i) => (
            <span key={p.slug}>
              {i > 0 && " · "}
              <Link href={`/rent/${p.slug}`} className="hover:text-foreground underline">
                {p.title}
              </Link>
            </span>
          ))}
      </p>
    </Section>
  );
}

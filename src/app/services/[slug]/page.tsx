import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { getServicePage, servicePages } from "@/lib/content/service-pages";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePage(slug);
  return {
    title: page?.name ?? "Service",
    description: page?.intro,
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) notFound();

  return (
    <Section className="pt-16 pb-24 sm:pt-20">
      <p className="text-small mb-6">
        <Link href="/services" className="hover:text-foreground">
          Services
        </Link>
        <span className="mx-2 text-muted-foreground/50">/</span>
        <span className="text-foreground">{page.name}</span>
      </p>

      <div className="max-w-2xl">
        <Heading level="display" eyebrow={page.name}>
          {page.title}
        </Heading>
        <p className="text-body mt-6">{page.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <WhatsAppButton
            label={page.whatsapp.label}
            heading={page.whatsapp.heading}
            closingLine={page.whatsapp.closingLine}
            size="lg"
            variant="default"
            className="uppercase tracking-wide"
          />
          <Button asChild size="lg" variant="outline" className="uppercase tracking-wide">
            <Link href="/equipment">Browse Equipment</Link>
          </Button>
        </div>
      </div>

      <Divider className="my-12" />

      <div className="grid max-w-4xl gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-h3">How it works</h2>
          <ol className="mt-5 flex flex-col gap-5">
            {page.steps.map((step, i) => (
              <li key={step.heading} className="flex gap-4">
                <span className="font-heading flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.heading}</p>
                  <p className="text-small mt-1">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-h3">What it covers</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {page.covers.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                <span className="text-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

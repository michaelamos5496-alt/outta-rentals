import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { getPackageBySlug } from "@/lib/packages";
import { PackageBuilder } from "@/components/packages/package-builder";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  return { title: pkg ? `${pkg.name} Package` : "Package Not Found" };
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);

  if (!pkg) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Package not found"
          description={`We couldn't find a package matching "${slug}".`}
          action={
            <Button asChild variant="outline">
              <Link href="/packages">Browse packages</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <p className="text-small mb-6">
        <Link href="/packages" className="hover:text-foreground">
          Packages
        </Link>
        <span className="mx-2 text-muted-foreground/50">/</span>
        <span className="text-foreground">{pkg.name}</span>
      </p>

      <Heading level="h1" eyebrow="Production Package">
        {pkg.name} Package
      </Heading>
      <p className="text-body mt-4 max-w-xl">{pkg.description}</p>
      <p className="text-small mt-2 max-w-xl">
        Starting point only — add, remove or adjust quantities below before
        adding it to your kit.
      </p>

      <div className="mt-10 max-w-2xl">
        <PackageBuilder pkg={pkg} />
      </div>
    </Container>
  );
}

import Link from "next/link";

import { getAdminPackage, isPackageEdited } from "@/lib/admin/packages";
import { listProducts } from "@/lib/admin/catalogue";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { PackageEditor } from "@/components/admin/package-editor";

interface EditPackagePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Edit Package" };

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { slug } = await params;
  const [pkg, productList, edited] = await Promise.all([getAdminPackage(slug), listProducts(), isPackageEdited(slug)]);

  if (!pkg) {
    return (
      <EmptyState
        title="Package not found"
        description="It may not be published."
        action={
          <Button asChild variant="outline">
            <Link prefetch={false} href="/admin/packages">Back to packages</Link>
          </Button>
        }
      />
    );
  }

  const products = productList
    .filter((p) => !p.archived)
    .map((p) => ({ slug: p.slug, name: p.name, dayRate: p.dayRate, currency: p.currency }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <Link prefetch={false} href="/admin/packages" className="text-small underline-offset-4 hover:underline">
        ← All packages
      </Link>
      <h1 className="text-h2 mt-2">Edit {pkg.name}</h1>
      <div className="mt-6">
        <PackageEditor pkg={pkg} products={products} edited={edited} />
      </div>
    </div>
  );
}

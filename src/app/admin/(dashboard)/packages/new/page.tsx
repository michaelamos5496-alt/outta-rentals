import Link from "next/link";

import { listProducts } from "@/lib/admin/catalogue";
import { PackageEditor } from "@/components/admin/package-editor";

export const metadata = { title: "New Package" };

export default async function NewPackagePage() {
  const products = (await listProducts())
    .filter((p) => !p.archived)
    .map((p) => ({ slug: p.slug, name: p.name, dayRate: p.dayRate, currency: p.currency }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <Link prefetch={false} href="/admin/packages" className="text-small underline-offset-4 hover:underline">
        ← All packages
      </Link>
      <h1 className="text-h2 mt-2">New package</h1>
      <p className="text-small mt-1 max-w-2xl">
        Name it, add one or more tiers, and pick the items in each. The total and discount are worked out
        for you, and the package appears on the site as soon as you create it.
      </p>
      <div className="mt-6">
        <PackageEditor pkg={null} products={products} edited={false} />
      </div>
    </div>
  );
}

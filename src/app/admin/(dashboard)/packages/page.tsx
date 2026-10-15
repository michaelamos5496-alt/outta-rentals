import Link from "next/link";
import { Pencil } from "lucide-react";

import { listAdminPackages, isPackageEdited } from "@/lib/admin/packages";
import { getTierFullPrice, getTierPrice } from "@/lib/packages";
import { formatPrice, formatTotal } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Packages" };

export default async function AdminPackagesPage() {
  const packages = await listAdminPackages();
  const edited = await Promise.all(packages.map((p) => isPackageEdited(p.slug)));

  return (
    <div>
      <h1 className="text-h2">Packages</h1>
      <p className="text-small mt-1 max-w-2xl">
        Edit what each package includes. The total is added up from the items&rsquo; day rates and the
        discount is applied automatically — change an item, a quantity or the discount and the price
        updates everywhere on the site.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {packages.map((pkg, i) => (
          <section key={pkg.slug} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-h3">{pkg.name}</h2>
                  {edited[i] ? <Badge variant="outline">Edited</Badge> : null}
                </div>
                <p className="text-small mt-1">{pkg.description}</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link prefetch={false} href={`/admin/packages/${pkg.slug}`}>
                  <Pencil /> Edit
                </Link>
              </Button>
            </div>

            <ul className="mt-4 divide-y divide-border text-sm">
              {pkg.tiers.map((tier) => {
                const price = getTierPrice(tier);
                const full = getTierFullPrice(tier);
                return (
                  <li key={tier.slug} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium">{tier.label}</p>
                      <p className="text-small">
                        {tier.items.length} items
                        {typeof tier.discountPercent === "number" ? ` · ${tier.discountPercent}% off` : ""}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      {price && full.length > 0 ? (
                        <p className="text-xs text-muted-foreground line-through">{formatTotal(full)}</p>
                      ) : null}
                      <p className="font-semibold">
                        {price ? `${formatPrice(price.amount, price.currency)}/day` : "—"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

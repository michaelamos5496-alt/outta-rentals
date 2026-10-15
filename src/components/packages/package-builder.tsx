"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getBrandBySlug, getProductBySlug } from "@/lib/catalogue";
import { useKit } from "@/components/kit/kit-provider";
import type { PackageLineItem } from "@/lib/packages/types";
import { getLineChoices } from "@/lib/packages/swaps";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";

export interface PackageBuilderProps {
  /** Identifies which package/tier this builder is for — tagged onto cart
   * lines on add, so the cart can keep pricing this group as a package. */
  packageSlug: string;
  tierSlug: string;
  /** The tier's line items — pass a new `key` from the parent when these change (e.g. the tier slug) so any swaps reset. */
  items: PackageLineItem[];
  /** OUTTA's quoted price for the package exactly as it is, per day. */
  quotedPrice?: { amount: number; currency: string };
  /** The package discount, as a percent. Applied to the new total when an item is swapped. */
  discountPercent?: number;
}

/**
 * A package's contents. Items can't be removed or resized — the package is
 * what it is — but any item can be swapped for similar equipment, at any
 * price. A swap re-prices the package from what's actually in it, with the
 * package discount applied to the new total.
 */
function PackageBuilder({ packageSlug, tierSlug, items, quotedPrice, discountPercent }: PackageBuilderProps) {
  const router = useRouter();
  const { addItem } = useKit();
  // The product currently chosen for each line, by position.
  const [chosen, setChosen] = React.useState<string[]>(() => items.map((i) => i.productSlug));
  const [added, setAdded] = React.useState(false);

  const rows = items
    .map((line, index) => {
      const product = getProductBySlug(chosen[index] ?? line.productSlug);
      return product ? { line, index, product } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // Each line at its own rate: the tier's override only applies to the quoted item.
  const rateOf = (r: (typeof rows)[number]) =>
    (r.product.slug === r.line.productSlug ? (r.line.dayRate ?? r.product.dayRate) : r.product.dayRate) *
    r.line.quantity;
  const liveAmount = rows.reduce((sum, r) => sum + rateOf(r), 0);
  const currency = rows[0]?.product.currency ?? quotedPrice?.currency ?? "GHS";
  const swapped = rows.some((r) => r.product.slug !== r.line.productSlug);

  // Untouched, it's OUTTA's quoted price. After a swap it's what's in the
  // package now, less the package discount.
  let packagePrice: number | null = quotedPrice?.amount ?? null;
  if (swapped) {
    if (typeof discountPercent === "number") {
      packagePrice = Math.round((liveAmount * (100 - discountPercent)) / 100);
    } else if (quotedPrice) {
      const baseline = items.reduce((sum, line) => {
        const p = getProductBySlug(line.productSlug);
        return sum + (line.dayRate ?? p?.dayRate ?? 0) * line.quantity;
      }, 0);
      packagePrice = Math.max(0, quotedPrice.amount + (liveAmount - baseline));
    }
  }
  const savings =
    packagePrice !== null && liveAmount > packagePrice
      ? {
          amount: liveAmount - packagePrice,
          percent: Math.round(((liveAmount - packagePrice) / liveAmount) * 100),
        }
      : null;

  function swap(index: number, slug: string) {
    setChosen((c) => c.map((s, i) => (i === index ? slug : s)));
  }

  function handleAddPackage() {
    // Always tagged: a package is only ever swapped, never trimmed, so the
    // cart can recognise it and price it as a package.
    rows.forEach((r) =>
      addItem(r.product.slug, r.line.quantity, { silent: true, packageSlug, packageTierSlug: tierSlug })
    );
    setAdded(true);
    router.push("/kit");
  }

  return (
    <div>
      <div className="flex flex-col divide-y divide-border border-y border-border">
        {rows.map(({ line, index, product }) => {
          const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
          const choices = getLineChoices(line, { items });

          return (
            <div key={`${line.role}-${index}`} className="flex gap-4 py-4">
              <Link
                href={`/equipment/${product.slug}`}
                className="block size-16 shrink-0 overflow-hidden rounded-lg sm:size-20"
              >
                <MediaPlaceholder
                  src={getProductImage(product.slug)}
                  alt={product.name}
                  className="size-full"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="min-w-0">
                  <Badge variant="technical" className="mb-1.5">
                    {line.role}
                  </Badge>
                  <p className="text-label truncate text-muted-foreground">{brand}</p>
                  <Link href={`/equipment/${product.slug}`}>
                    <h3 className="truncate font-medium leading-snug hover:text-brand">{product.name}</h3>
                  </Link>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-muted-foreground">Qty {line.quantity}</span>
                    {choices.length > 1 ? (
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        Swap
                        <select
                          aria-label={`Swap ${product.name} for similar equipment`}
                          value={product.slug}
                          onChange={(e) => swap(index, e.target.value)}
                          className="w-56 max-w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {choices.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.name} — {formatPrice(c.dayRate, c.currency)}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium">
                    <span className="font-mono">
                      {formatPrice(
                        (product.slug === line.productSlug ? (line.dayRate ?? product.dayRate) : product.dayRate) *
                          line.quantity,
                        product.currency
                      )}
                    </span>
                    <span className="font-sans text-muted-foreground"> /day</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Divider className="my-6" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm">
            {rows.length} item{rows.length === 1 ? "" : "s"} in this package
          </p>
          {packagePrice !== null && savings ? (
            <div className="mt-1.5">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-base text-muted-foreground line-through decoration-2">
                  {formatPrice(liveAmount, currency)}/day
                </span>
                <span className="font-mono text-xl font-bold">{formatPrice(packagePrice, currency)}/day</span>
              </p>
              <p className="text-meta mt-0.5">
                {swapped ? "Package discount applied to your swaps" : "OUTTA's package rate"} — you save{" "}
                {formatPrice(savings.amount, currency)}
                {savings.percent > 0 ? ` (${savings.percent}% off)` : ""} a day
              </p>
            </div>
          ) : (
            <p className="text-meta mt-0.5">
              {packagePrice !== null ? `${formatPrice(packagePrice, currency)}/day` : `${formatPrice(liveAmount, currency)}/day`}
            </p>
          )}
        </div>
        <Button size="lg" className="uppercase tracking-wide" onClick={handleAddPackage}>
          <Package /> {added ? "Added" : "Add Entire Package to Cart"}
        </Button>
      </div>
    </div>
  );
}

export { PackageBuilder };

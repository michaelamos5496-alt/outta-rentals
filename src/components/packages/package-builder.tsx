"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Package, Plus, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getBrandBySlug, getCategoryIcon, getProductBySlug } from "@/lib/catalogue";
import { useKit } from "@/components/kit/kit-provider";
import type { PackageLineItem } from "@/lib/packages/types";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice, formatTotal } from "@/lib/currency";

interface BuilderLine {
  role: string;
  productSlug: string;
  quantity: number;
  active: boolean;
}

export interface PackageBuilderProps {
  /** Identifies which package/tier this builder is for — tagged onto cart
   * lines on add, so the cart can keep pricing this group at OUTTA's flat
   * quoted rate instead of the sum of each item's own day rate. */
  packageSlug: string;
  tierSlug: string;
  /** The tier's line items — pass a new `key` from the parent when these change (e.g. the tier slug) so the builder's edits reset. */
  items: PackageLineItem[];
  /**
   * OUTTA's flat quoted rate for this exact, un-customized bundle. Shown
   * instead of the live per-item sum until the customer edits the package —
   * once they add, remove or resize a line, the flat quote no longer
   * describes what's in the kit, so the total switches to a live sum.
   */
  quotedPrice?: { amount: number; currency: string };
}

function PackageBuilder({ packageSlug, tierSlug, items, quotedPrice }: PackageBuilderProps) {
  const router = useRouter();
  const { addItem } = useKit();
  const [lines, setLines] = React.useState<BuilderLine[]>(
    items.map((item) => ({ ...item, active: true }))
  );
  const [added, setAdded] = React.useState(false);
  const [customized, setCustomized] = React.useState(false);

  function setQuantity(index: number, quantity: number) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, quantity) } : l)));
    setCustomized(true);
  }

  function toggleActive(index: number, active: boolean) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, active } : l)));
    setCustomized(true);
  }

  const activeLines = lines
    .map((line, index) => ({ line, index, product: getProductBySlug(line.productSlug) }))
    .filter((l): l is { line: BuilderLine; index: number; product: NonNullable<ReturnType<typeof getProductBySlug>> } =>
      Boolean(l.product)
    );

  const activeCount = activeLines.filter((l) => l.line.active).length;
  const liveTotal = formatTotal(
    activeLines
      .filter((l) => l.line.active)
      .map((l) => ({ amount: l.product.dayRate * l.line.quantity, currency: l.product.currency }))
  );
  // OUTTA's flat quote for the preset bundle, until the customer changes it —
  // then the total has to reflect what's actually in the kit.
  const useQuotedPrice = quotedPrice && !customized;
  const dailyTotal = useQuotedPrice ? formatPrice(quotedPrice.amount, quotedPrice.currency) : liveTotal;

  function handleAddPackage() {
    // Only tag lines with this package/tier while the bundle is still
    // exactly what OUTTA quoted — once customized, items go in as plain
    // individual equipment so the cart prices them at their own day rate.
    const tag = useQuotedPrice ? { packageSlug, packageTierSlug: tierSlug } : {};
    activeLines
      .filter((l) => l.line.active)
      .forEach((l) => addItem(l.product.slug, l.line.quantity, { silent: true, ...tag }));
    setAdded(true);
    router.push("/kit");
  }

  return (
    <div>
      <div className="flex flex-col divide-y divide-border border-y border-border">
        {activeLines.map(({ line, index, product }) => {
          const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
          const icon = getCategoryIcon(product.categorySlug);

          if (!line.active) {
            return (
              <div key={line.role} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-label">{line.role}</p>
                  <p className="text-small mt-0.5">Removed from this package</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(index, true)}>
                  <RotateCcw /> Add back
                </Button>
              </div>
            );
          }

          return (
            <div key={line.role} className="flex gap-4 py-4">
              <Link
                href={`/equipment/${product.slug}`}
                className="block size-16 shrink-0 overflow-hidden rounded-lg sm:size-20"
              >
                <MediaPlaceholder
                  src={getProductImage(product.slug, product.categorySlug)}
                  alt={product.name}
                  icon={icon}
                  className="size-full"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Badge variant="technical" className="mb-1.5">
                      {line.role}
                    </Badge>
                    <p className="text-label truncate text-muted-foreground">{brand}</p>
                    <Link href={`/equipment/${product.slug}`}>
                      <h3 className="truncate font-medium leading-snug hover:text-brand">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${line.role} from package`}
                    onClick={() => toggleActive(index, false)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X />
                  </Button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div className="flex items-center gap-1 rounded-lg border border-input">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Decrease quantity"
                      disabled={line.quantity <= 1}
                      onClick={() => setQuantity(index, line.quantity - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(index, line.quantity + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <p className="text-sm font-medium">
                    <span className="font-mono">{formatPrice(product.dayRate * line.quantity, product.currency)}</span>
                    <span className="font-sans text-muted-foreground"> /day</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Divider className="my-6" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">
            {activeCount} item{activeCount === 1 ? "" : "s"} in this package
          </p>
          <p className="text-meta mt-0.5">
            {dailyTotal}/day{useQuotedPrice ? " — OUTTA's quoted rate" : ""}
          </p>
        </div>
        <Button
          size="lg"
          className="uppercase tracking-wide"
          disabled={activeCount === 0}
          onClick={handleAddPackage}
        >
          <Package /> {added ? "Added" : "Add Entire Package to Cart"}
        </Button>
      </div>
    </div>
  );
}

export { PackageBuilder };

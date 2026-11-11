"use client";

import * as React from "react";
import { ChevronDown, Minus, Package, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import type { ResolvedPackageGroup } from "@/lib/kit/pricing";
import { useKit } from "@/components/kit/kit-provider";
import { getProductImage } from "@/lib/editorial-images";
import { formatPrice } from "@/lib/currency";

export interface KitPackageRowProps {
  group: ResolvedPackageGroup;
  compact?: boolean;
}

/**
 * A package in the cart, shown as one row — its name, tier and price — with
 * the equipment tucked under "What's included" instead of listed out.
 */
function KitPackageRow({ group, compact = false }: KitPackageRowProps) {
  const { removePackage, setPackageCopies } = useKit();
  const [open, setOpen] = React.useState(false);
  const title = `${group.packageName} Package`;
  const lead = group.items.find((l) => l.product.categorySlug === "cameras") ?? group.items[0];
  const itemCount = group.items.reduce((n, l) => n + l.quantity / group.quantity, 0);
  const saving = group.fullTotal - group.total;

  return (
    <div className="py-4">
      <div className="flex gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg sm:size-20">
          {lead ? (
            <MediaPlaceholder src={getProductImage(lead.product.slug)} alt={title} className="size-full" />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <Package className="size-6 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Badge variant="brand" className="mb-1.5">
                Package · {group.tierLabel}
              </Badge>
              <h3 className="font-medium leading-snug">{title}</h3>
              <p className="text-meta mt-0.5">
                {itemCount} item{itemCount === 1 ? "" : "s"} included
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${title} from cart`}
              onClick={() => removePackage(group.packageSlug, group.tierSlug)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div className="flex items-center gap-1 rounded-lg border border-input">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Decrease packages"
                disabled={group.quantity <= 1}
                onClick={() =>
                  setPackageCopies(group.packageSlug, group.tierSlug, group.quantity - 1, group.quantity)
                }
              >
                <Minus />
              </Button>
              <span className="w-6 text-center text-sm tabular-nums">{group.quantity}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Increase packages"
                onClick={() =>
                  setPackageCopies(group.packageSlug, group.tierSlug, group.quantity + 1, group.quantity)
                }
              >
                <Plus />
              </Button>
            </div>

            <div className="text-right">
              {!compact && group.rentalDays > 0 ? (
                <p className="text-meta">
                  {formatPrice(group.dayPrice, group.currency)}/day × {group.quantity} × {group.rentalDays}d
                </p>
              ) : null}
              {group.rentalDays > 0 && saving > 0 ? (
                <p className="text-meta line-through">{formatPrice(group.fullTotal, group.currency)}</p>
              ) : null}
              <p className="font-mono text-sm font-medium">
                {group.rentalDays > 0
                  ? formatPrice(group.total, group.currency)
                  : `${formatPrice(group.dayPrice * group.quantity, group.currency)}/day`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-meta mt-3 flex items-center gap-1 hover:text-foreground"
      >
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        {open ? "Hide" : "What's included"}
      </button>
      {open ? (
        <ul className="mt-2 flex flex-col gap-1 pl-1 text-sm text-muted-foreground">
          {group.items.map((l) => (
            <li key={l.product.slug}>
              {l.product.name} × {l.quantity}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { KitPackageRow };

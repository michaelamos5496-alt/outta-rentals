"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { getBrandBySlug, getCategoryIcon } from "@/lib/catalogue";
import type { ResolvedKitLine } from "@/lib/kit/pricing";
import { useKit } from "@/components/kit/kit-provider";

export interface KitItemRowProps {
  line: ResolvedKitLine;
  compact?: boolean;
}

function KitItemRow({ line, compact = false }: KitItemRowProps) {
  const { setQuantity, removeItem } = useKit();
  const { product, quantity, lineTotal } = line;
  const brand = getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug;
  const icon = getCategoryIcon(product.categorySlug);
  const href = `/equipment/${product.slug}`;

  return (
    <div className="flex gap-4 py-4">
      <Link href={href} className="block size-16 shrink-0 overflow-hidden rounded-lg sm:size-20">
        <MediaPlaceholder icon={icon} className="size-full" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-label truncate text-muted-foreground">{brand}</p>
            <Link href={href}>
              <h3 className="truncate font-medium leading-snug hover:text-brand">
                {product.name}
              </h3>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${product.name} from kit`}
            onClick={() => removeItem(product.slug)}
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
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity(product.slug, quantity - 1)}
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Increase quantity"
              onClick={() => setQuantity(product.slug, quantity + 1)}
            >
              <Plus />
            </Button>
          </div>

          <div className="text-right">
            {!compact && line.rentalDays > 0 ? (
              <p className="text-meta">
                ${product.dayRate}/day × {quantity} × {line.rentalDays}d
              </p>
            ) : null}
            <p className="text-sm font-medium">
              {line.rentalDays > 0 ? `$${lineTotal.toLocaleString()}` : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { KitItemRow };

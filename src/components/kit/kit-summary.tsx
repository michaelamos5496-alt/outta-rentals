"use client";

import * as React from "react";
import Link from "next/link";
import { Package, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/state";
import { resolveKitBreakdown, resolveKitPricing } from "@/lib/kit/pricing";
import { useKit } from "@/components/kit/kit-provider";
import { KitItemRow } from "@/components/kit/kit-item-row";
import { KitPackageRow } from "@/components/kit/kit-package-row";
import { RentalDates } from "@/components/kit/rental-dates";
import { formatTotal } from "@/lib/currency";

export interface KitSummaryProps {
  compact?: boolean;
  showDates?: boolean;
  emptyAction?: React.ReactNode;
  footer?: React.ReactNode;
  /** Rendered directly under the total, above the Clear cart row. */
  underTotal?: React.ReactNode;
}

function KitSummary({ compact = false, showDates = true, emptyAction, footer, underTotal }: KitSummaryProps) {
  const { items, rentalDays, dateError, clearKit } = useKit();
  // Packages that still match their tier show as one row each, priced at
  // OUTTA's flat quoted rate; everything else is listed item by item.
  const pricing = resolveKitBreakdown(items, rentalDays ?? 0);
  const total = formatTotal(pricing.totalEntries);
  const canPrice = !dateError && rentalDays !== null;
  // Before dates are picked, show a per-day estimate instead of a blank
  // dash — packages especially are checked out with a quoted "/day" price
  // already visible, so the cart shouldn't look like it lost that number.
  const perDayTotal = formatTotal(resolveKitPricing(items, 1).totalEntries);

  const individualCount = pricing.individuals.reduce((n, l) => n + l.quantity, 0);
  const packageCount = pricing.packages.reduce((n, g) => n + g.quantity, 0);
  const summaryLabel = [
    packageCount > 0 ? `${packageCount} package${packageCount === 1 ? "" : "s"}` : "",
    individualCount > 0 ? `${individualCount} item${individualCount === 1 ? "" : "s"}` : "",
  ]
    .filter(Boolean)
    .join(" + ");

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Your cart is empty"
        description="Add equipment while you browse — it'll show up here."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {showDates ? (
        <>
          <RentalDates />
          <Divider className="mt-4" />
        </>
      ) : null}

      <div className="flex flex-col divide-y divide-border">
        {pricing.packages.map((group) => (
          <KitPackageRow key={`${group.packageSlug}::${group.tierSlug}`} group={group} compact={compact} />
        ))}
        {pricing.individuals.map((line) => (
          <KitItemRow key={line.product.slug} line={line} compact={compact} />
        ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-1.5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{summaryLabel}</span>
          <span className="font-mono font-medium">
            {canPrice ? total : `${perDayTotal}/day`}
          </span>
        </div>
        {!canPrice ? <p className="text-meta">Set rental dates to see the total for your dates.</p> : null}
      </div>

      {underTotal ? <div className="mb-3">{underTotal}</div> : null}

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={clearKit}>
          <Trash2 /> Clear cart
        </Button>
        {!footer ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/equipment">Continue browsing</Link>
          </Button>
        ) : null}
      </div>

      {footer}
    </div>
  );
}

export { KitSummary };

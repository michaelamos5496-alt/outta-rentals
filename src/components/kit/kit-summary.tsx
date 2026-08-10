"use client";

import * as React from "react";
import Link from "next/link";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/state";
import { resolveKitLines, getKitTotal } from "@/lib/kit/pricing";
import { useKit } from "@/components/kit/kit-provider";
import { KitItemRow } from "@/components/kit/kit-item-row";
import { RentalDates } from "@/components/kit/rental-dates";
import { formatPrice } from "@/lib/currency";

export interface KitSummaryProps {
  compact?: boolean;
  showDates?: boolean;
  emptyAction?: React.ReactNode;
  footer?: React.ReactNode;
}

function KitSummary({ compact = false, showDates = true, emptyAction, footer }: KitSummaryProps) {
  const { items, rentalDays, dateError, clearKit } = useKit();
  const lines = resolveKitLines(items, rentalDays ?? 0);
  const total = getKitTotal(lines);
  const canPrice = !dateError && rentalDays !== null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Your kit is empty"
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
        {lines.map((line) => (
          <KitItemRow key={line.product.slug} line={line} compact={compact} />
        ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-1.5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {items.reduce((n, i) => n + i.quantity, 0)} item
            {items.reduce((n, i) => n + i.quantity, 0) === 1 ? "" : "s"}
          </span>
          <span className="font-medium">
            {canPrice ? formatPrice(total) : "—"}
          </span>
        </div>
        <p className="text-meta">
          {canPrice
            ? "Estimate — final quote confirmed by OUTTA."
            : "Set valid rental dates to see an estimate."}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={clearKit}>
          Clear kit
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

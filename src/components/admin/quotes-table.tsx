"use client";

import * as React from "react";
import Link from "next/link";

import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { QuoteStatusBadge, quoteStatusLabels, quoteStatuses } from "@/components/admin/quote-status-badge";
import type { AdminQuote, AdminQuoteStatus } from "@/lib/admin/types";
import {
  quoteCustomerLabel,
  quoteDateRange,
  quoteHref,
  quoteTitle,
  quoteTotal,
} from "@/lib/admin/format";

function QuotesTable({
  quotes,
  statuses = quoteStatuses,
}: {
  quotes: AdminQuote[];
  statuses?: AdminQuoteStatus[];
}) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const filtered = quotes.filter((q) => {
    if (status !== "all" && q.status !== status) return false;
    if (!query.trim()) return true;
    const haystack = `${q.customerName} ${q.projectName} ${q.customerEmail} ${q.customerPhone}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          containerClassName="flex-1"
          placeholder="Search by customer, project, phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {quoteStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Delete</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-small py-8 text-center">
                  No quotes match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((quote) => (
                <TableRow key={quote.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={quoteHref(quote)} className="block hover:text-brand">
                      <p className="font-medium">{quoteCustomerLabel(quote)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{quote.customerPhone || quote.customerEmail}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={quoteHref(quote)} className="block">
                      {quoteTitle(quote)}
                      <span className="ml-2 text-xs text-muted-foreground">{quote.projectType}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {quoteDateRange(quote)}
                  </TableCell>
                  <TableCell>{quoteTotal(quote)}</TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteOrderButton
                      compact
                      id={quote.id}
                      confirmed={quote.status === "confirmed"}
                      label={quoteCustomerLabel(quote)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { QuotesTable };

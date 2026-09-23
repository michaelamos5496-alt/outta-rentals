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
import { QuoteStatusBadge, quoteStatusLabels, quoteStatuses } from "@/components/admin/quote-status-badge";
import type { AdminQuote } from "@/lib/admin/types";
import { quoteCustomerLabel, quoteDateRange, quoteTitle, quoteTotal } from "@/lib/admin/format";

function QuotesTable({ quotes }: { quotes: AdminQuote[] }) {
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
            {quoteStatuses.map((s) => (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-small py-8 text-center">
                  No quotes match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((quote) => (
                <TableRow key={quote.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/quotes/${quote.id}`} className="block hover:text-brand">
                      <p className="font-medium">{quoteCustomerLabel(quote)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{quote.customerPhone || quote.customerEmail}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/quotes/${quote.id}`} className="block">
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

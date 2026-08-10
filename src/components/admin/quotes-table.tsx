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
import { formatPrice } from "@/lib/currency";

function QuotesTable({ quotes }: { quotes: AdminQuote[] }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const filtered = quotes.filter((q) => {
    if (status !== "all" && q.status !== status) return false;
    if (!query.trim()) return true;
    const haystack = `${q.customerName} ${q.projectName} ${q.customerEmail}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          containerClassName="flex-1"
          placeholder="Search by customer, project, email…"
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

      <div className="mt-4 rounded-lg border border-border">
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
                      <p className="font-medium">{quote.customerName}</p>
                      <p className="text-meta mt-0.5">{quote.customerEmail}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/quotes/${quote.id}`} className="block">
                      {quote.projectName}
                      <span className="text-meta ml-2">{quote.projectType}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(quote.startDate).toLocaleDateString()} →{" "}
                    {new Date(quote.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatPrice(quote.estimatedTotal)}</TableCell>
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

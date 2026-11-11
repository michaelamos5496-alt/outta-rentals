"use client";

import * as React from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export interface AdminProductRow {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  priceLabel: string;
  statusLabel: string;
  statusVariant: React.ComponentProps<typeof Badge>["variant"];
  featured: boolean;
  archived: boolean;
}

/** The admin products list with a live search over name, brand and category. */
function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const visible = q
    ? products.filter((p) => [p.name, p.brandName, p.categoryName].join(" ").toLowerCase().includes(q))
    : products;

  return (
    <div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <SearchInput
          containerClassName="w-full max-w-sm"
          placeholder="Search products, brands or categories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {q ? (
          <p className="text-small shrink-0">
            {visible.length} of {products.length}
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Day rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No products match “{query.trim()}”.
                </TableCell>
              </TableRow>
            ) : null}
            {visible.map((product) => (
              <TableRow key={product.id} className={product.archived ? "opacity-50" : undefined}>
                <TableCell className="max-w-56 truncate font-medium">
                  <Link prefetch={false} href={`/admin/products/${product.id}`} className="hover:text-brand">
                    {product.name}
                  </Link>
                  {product.archived ? <span className="text-meta ml-2">Archived</span> : null}
                </TableCell>
                <TableCell>{product.brandName}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>{product.priceLabel}</TableCell>
                <TableCell>
                  <Badge variant={product.statusVariant}>{product.statusLabel}</Badge>
                </TableCell>
                <TableCell>{product.featured ? "Yes" : "—"}</TableCell>
                <TableCell className="text-right">
                  <ProductRowActions id={product.id} archived={product.archived} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { ProductsTable };

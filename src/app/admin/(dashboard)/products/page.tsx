import Link from "next/link";
import { Plus } from "lucide-react";

import { listProducts } from "@/lib/admin/store";
import { availabilityLabels, availabilityVariant, getBrandBySlug, getCategoryBySlug } from "@/lib/catalogue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatPrice } from "@/lib/currency";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  const products = listProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2">Products</h1>
          <p className="text-small mt-1">{products.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus /> New Product
          </Link>
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-border">
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
            {products.map((product) => (
              <TableRow key={product.id} className={product.archived ? "opacity-50" : undefined}>
                <TableCell className="max-w-56 truncate font-medium">
                  <Link href={`/admin/products/${product.id}`} className="hover:text-brand">
                    {product.name}
                  </Link>
                  {product.archived ? (
                    <span className="text-meta ml-2">Archived</span>
                  ) : null}
                </TableCell>
                <TableCell>{getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug}</TableCell>
                <TableCell>{getCategoryBySlug(product.categorySlug)?.name ?? product.categorySlug}</TableCell>
                <TableCell>{formatPrice(product.dayRate)}</TableCell>
                <TableCell>
                  <Badge variant={availabilityVariant[product.availability]}>
                    {availabilityLabels[product.availability]}
                  </Badge>
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

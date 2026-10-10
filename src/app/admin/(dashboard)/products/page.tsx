import Link from "next/link";
import { Plus } from "lucide-react";

import { listProducts } from "@/lib/admin/catalogue";
import { availabilityLabels, availabilityVariant, getBrandBySlug, getCategoryBySlug } from "@/lib/catalogue";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";
import { formatPrice } from "@/lib/currency";
import { listProductStock } from "@/lib/admin/quotes";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [allProducts, stock] = await Promise.all([listProducts(), listProductStock()]);
  const products = allProducts.map((p) => ({
    ...p,
    availability: stock.get(p.slug)?.status ?? p.availability,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2">Products</h1>
          <p className="text-small mt-1">{products.length} total</p>
        </div>
        <Button asChild>
          <Link prefetch={false} href="/admin/products/new">
            <Plus /> New Product
          </Link>
        </Button>
      </div>

      <ProductsTable
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          brandName: getBrandBySlug(p.brandSlug)?.name ?? p.brandSlug,
          categoryName: getCategoryBySlug(p.categorySlug)?.name ?? p.categorySlug,
          priceLabel: formatPrice(p.dayRate),
          statusLabel: availabilityLabels[p.availability],
          statusVariant: availabilityVariant[p.availability],
          featured: Boolean(p.featured),
          archived: Boolean(p.archived),
        }))}
      />
    </div>
  );
}

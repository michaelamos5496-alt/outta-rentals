import { listProducts } from "@/lib/admin/store";
import { availabilityLabels, getBrandBySlug, getCategoryBySlug } from "@/lib/catalogue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryStatusSelect } from "@/components/admin/inventory-status-select";
import { UnitsOwnedInput } from "@/components/admin/units-owned-input";
import { listProductStock } from "@/lib/admin/quotes";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const stock = await listProductStock();
  const stockSaved = Boolean(getSupabaseServerClient());
  const products = listProducts()
    .filter((p) => !p.archived)
    .map((p) => ({ ...p, availability: stock.get(p.slug)?.status ?? p.availability }));

  const counts = Object.keys(availabilityLabels).map((status) => ({
    status,
    label: availabilityLabels[status as keyof typeof availabilityLabels],
    count: products.filter((p) => p.availability === status).length,
  }));

  return (
    <div>
      <h1 className="text-h2">Inventory</h1>
      <p className="text-small mt-1">
        Status shows on the live site straight away — e.g. set a broken item to Maintenance.
        Units owned decide how many can be booked for the same dates.
        {stockSaved ? "" : " Connect Supabase to save changes."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map((c) => (
          <div key={c.status} className="rounded-lg border border-border p-3">
            <p className="text-label">{c.label}</p>
            <p className="text-h3 mt-1">{c.count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Units owned</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{getBrandBySlug(product.brandSlug)?.name ?? product.brandSlug}</TableCell>
                <TableCell>
                  {getCategoryBySlug(product.categorySlug)?.name ?? product.categorySlug}
                </TableCell>
                <TableCell>
                  <UnitsOwnedInput
                    slug={product.slug}
                    value={stock.get(product.slug)?.units ?? 1}
                    disabled={!stockSaved}
                  />
                </TableCell>
                <TableCell>
                  <InventoryStatusSelect
                    slug={product.slug}
                    value={product.availability}
                    disabled={!stockSaved}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

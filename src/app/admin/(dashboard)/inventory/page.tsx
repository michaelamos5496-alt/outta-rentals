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

export const metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  const products = listProducts().filter((p) => !p.archived);

  const counts = Object.keys(availabilityLabels).map((status) => ({
    status,
    label: availabilityLabels[status as keyof typeof availabilityLabels],
    count: products.filter((p) => p.availability === status).length,
  }));

  return (
    <div>
      <h1 className="text-h2">Inventory</h1>
      <p className="text-small mt-1">Update stock status directly — changes apply immediately.</p>

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
                  <InventoryStatusSelect id={product.id} value={product.availability} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

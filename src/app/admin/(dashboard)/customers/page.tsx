import Link from "next/link";

import { listCustomers } from "@/lib/admin/quotes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <h1 className="text-h2">Customers</h1>
      <p className="text-small mt-1">
        {customers.length} customers, grouped by phone number from Send Kit orders.
      </p>

      <div className="mt-6 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Quotes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.key}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/customers/${encodeURIComponent(customer.key)}`}
                    className="hover:text-brand"
                  >
                    {customer.name || customer.phone || "Unnamed customer"}
                  </Link>
                </TableCell>
                <TableCell>{customer.company || "—"}</TableCell>
                <TableCell>{customer.email || "—"}</TableCell>
                <TableCell>{customer.phone || "—"}</TableCell>
                <TableCell>{customer.quotes.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

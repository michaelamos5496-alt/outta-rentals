import Link from "next/link";

import { listCustomers } from "@/lib/admin/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  const customers = listCustomers();

  return (
    <div>
      <h1 className="text-h2">Customers</h1>
      <p className="text-small mt-1">
        {customers.length} customers, derived from submitted quotes.
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
              <TableRow key={customer.email}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                    className="hover:text-brand"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell>{customer.company || "—"}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.quotes.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

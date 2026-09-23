import { listCategories } from "@/lib/admin/store";
import { CategoryManager } from "@/components/admin/category-manager";
import { UnsavedEditsNotice } from "@/components/admin/unsaved-edits-notice";
import { catalogueEditable } from "@/lib/admin/catalogue-editing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  const categories = listCategories();

  return (
    <div>
      <h1 className="text-h2">Categories</h1>
      <UnsavedEditsNotice />
      <div className="mt-6">
        {catalogueEditable ? (
          <CategoryManager categories={categories} />
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

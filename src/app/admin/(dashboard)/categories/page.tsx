import { listCategories } from "@/lib/admin/store";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  const categories = listCategories();

  return (
    <div>
      <h1 className="text-h2">Categories</h1>
      <p className="text-small mt-1">Demo data — resets when the server restarts.</p>
      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}

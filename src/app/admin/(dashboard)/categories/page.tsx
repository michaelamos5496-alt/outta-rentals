import { listCategories } from "@/lib/admin/catalogue";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="text-h2">Categories</h1>
      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}

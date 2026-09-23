import { listCategories } from "@/lib/admin/store";
import { CategoryManager } from "@/components/admin/category-manager";
import { UnsavedEditsNotice } from "@/components/admin/unsaved-edits-notice";

export const metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  const categories = listCategories();

  return (
    <div>
      <h1 className="text-h2">Categories</h1>
      <UnsavedEditsNotice />
      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { catalogueEditable } from "@/lib/admin/catalogue-editing";
import { UnsavedEditsNotice } from "@/components/admin/unsaved-edits-notice";

export const metadata = { title: "New Product" };

export default function NewProductPage() {
  if (!catalogueEditable) redirect("/admin/products");
  return (
    <div>
      <h1 className="text-h2">New product</h1>
      <UnsavedEditsNotice />
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}

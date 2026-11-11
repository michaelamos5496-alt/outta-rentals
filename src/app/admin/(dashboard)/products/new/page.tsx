import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New Product" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-h2">New product</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}

import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New Product" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-h2">New product</h1>
      <p className="text-small mt-1">Demo data — resets when the server restarts.</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}

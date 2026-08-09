import Link from "next/link";

import { getProductById } from "@/lib/admin/store";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="It may have been deleted."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/products">Back to products</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="text-h2">Edit product</h1>
      <p className="text-small mt-1">{product.name}</p>
      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}

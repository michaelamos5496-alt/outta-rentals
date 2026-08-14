import { Heading } from "@/components/ui/heading";
import { ProductCard } from "@/components/catalogue/product-card";
import type { DemoProduct } from "@/lib/catalogue";

export interface ProductShelfProps {
  title: string;
  eyebrow: string;
  products: DemoProduct[];
}

function ProductShelf({ title, eyebrow, products }: ProductShelfProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border py-14 sm:py-16">
      <Heading level="h3" eyebrow={eyebrow}>
        {title}
      </Heading>
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export { ProductShelf };

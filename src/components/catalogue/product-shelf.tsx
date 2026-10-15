import { Heading } from "@/components/ui/heading";
import { ProductCard } from "@/components/catalogue/product-card";
import type { DemoProduct } from "@/lib/catalogue";

export interface ProductShelfProps {
  title: string;
  eyebrow: string;
  products: DemoProduct[];
  /** Small cards, more per row — for secondary shelves. */
  compact?: boolean;
}

function ProductShelf({ title, eyebrow, products, compact = false }: ProductShelfProps) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border py-14 sm:py-16">
      <div className="text-center">
        <Heading level="h3" eyebrow={eyebrow}>
          {title}
        </Heading>
      </div>
      <div
        className={
          compact
            ? "mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6"
            : "mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact={compact} />
        ))}
      </div>
    </section>
  );
}

export { ProductShelf };

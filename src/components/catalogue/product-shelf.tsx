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
      {compact ? (
        // Flex-wrap rather than a grid so a short row (or the last row) sits
        // centred under the heading instead of hugging the left edge.
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex w-[calc((100%-1rem)/3)] sm:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3.75rem)/6)]"
            >
              <ProductCard product={product} compact className="w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export { ProductShelf };

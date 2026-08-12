"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutoplayVideo } from "@/components/ui/autoplay-video";
import { slideUp, viewportOnce } from "@/lib/motion";
import { workProjects } from "@/lib/content/work";
import { themeImages } from "@/lib/editorial-images";
import { getProductBySlug } from "@/lib/catalogue";
import { useKit } from "@/components/kit/kit-provider";
import { formatPrice } from "@/lib/currency";

function slugifyProductionType(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function EquipmentUsedItem({
  productSlug,
  quantity,
}: {
  productSlug: string;
  quantity: number;
}) {
  const { addItem } = useKit();
  const [added, setAdded] = React.useState(false);
  const product = getProductBySlug(productSlug);

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  if (!product) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border py-2.5 pr-2.5 pl-3.5">
      <Link href={`/equipment/${product.slug}`} className="min-w-0 hover:text-brand">
        <p className="truncate text-sm font-medium">
          {product.name}
          {quantity > 1 ? <span className="text-muted-foreground"> ×{quantity}</span> : null}
        </p>
        <p className="text-meta">{formatPrice(product.dayRate, product.currency)}/day</p>
      </Link>
      <Button
        variant={added ? "secondary" : "outline"}
        size="sm"
        onClick={() => {
          addItem(product.slug, quantity);
          setAdded(true);
        }}
      >
        {added ? <Check /> : <Plus />}
        {added ? "Added" : "Add to Kit"}
      </Button>
    </div>
  );
}

export default function WorkPage() {
  return (
    <>
      <Section spacing="compact" className="pt-16 sm:pt-20">
        <Heading level="display" eyebrow="Work">
          Built for the set.
        </Heading>
        <p className="text-body mt-6 max-w-xl">
          A sample of the kinds of productions OUTTA equipment supports.
          Placeholder projects for illustration — no real clients are
          represented.
        </p>
      </Section>

      <div className="border-t border-border">
        {workProjects.map((project, i) => {
          const themeSlug = slugifyProductionType(project.productionType);
          return (
            <motion.article
              key={project.slug}
              id={project.slug}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={slideUp()}
              className="scroll-mt-20 border-b border-border"
            >
              <Section spacing="compact">
                <div
                  className={`grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16 ${
                    i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="overflow-hidden rounded-xl">
                    <AutoplayVideo
                      src="/video/about.mp4"
                      poster={themeImages[themeSlug]}
                      alt={project.title}
                      className="aspect-video w-full"
                    />
                  </div>
                  <div>
                    <Badge variant="technical">{project.productionType}</Badge>
                    <h2 className="text-h2 mt-3">{project.title}</h2>
                    <p className="text-body mt-3">{project.description}</p>

                    <p className="text-label mt-6 mb-2">Equipment used — rent this kit</p>
                    <div className="flex flex-col gap-2">
                      {project.equipmentUsed.map((item) => (
                        <EquipmentUsedItem
                          key={item.productSlug}
                          productSlug={item.productSlug}
                          quantity={item.quantity}
                        />
                      ))}
                    </div>

                    <p className="text-label mt-6 mb-2">Story</p>
                    <p className="text-body">{project.story}</p>
                  </div>
                </div>
              </Section>
            </motion.article>
          );
        })}
      </div>
    </>
  );
}

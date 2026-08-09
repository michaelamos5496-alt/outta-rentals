import Link from "next/link";

import { Container } from "@/components/ui/container";
import { equipmentCategories } from "@/lib/placeholder-data";

function EquipmentStrip() {
  return (
    <div className="border-y border-border bg-background">
      <Container>
        <div className="scrollbar-none flex snap-x gap-2 overflow-x-auto py-4 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible">
          {equipmentCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/equipment/${category.slug}`}
              className="group/chip flex shrink-0 snap-start items-center gap-2 rounded-full border border-border px-4 py-2 transition-colors hover:border-brand/50 hover:bg-brand/5"
            >
              <category.icon
                className="size-4 text-muted-foreground transition-colors group-hover/chip:text-brand"
                strokeWidth={1.5}
              />
              <span className="text-label whitespace-nowrap text-foreground/80 group-hover/chip:text-foreground">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

export { EquipmentStrip };

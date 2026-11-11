import Link from "next/link";

import { cn } from "@/lib/utils";

const tabs = [
  { key: "all", label: "All Lenses", href: "/equipment/lenses" },
  { key: "cine", label: "Cine Lens", href: "/equipment/lenses/cine-lens" },
  { key: "photo", label: "Photo Lens", href: "/equipment/lenses/photo-lens" },
] as const;

/** The Lenses page's two sub-sets, as pill links shown on all three lens pages. */
function LensTypeTabs({ active }: { active: (typeof tabs)[number]["key"] }) {
  return (
    <nav aria-label="Lens type" className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
            tab.key === active
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border text-foreground/70 hover:border-foreground/50 hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export { LensTypeTabs };

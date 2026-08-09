"use client";

import { usePathname } from "next/navigation";
import { Package } from "lucide-react";

import { useKit } from "@/components/kit/kit-provider";

function FloatingKitButton() {
  const pathname = usePathname();
  const { itemCount, openDrawer, hydrated } = useKit();

  if (!hydrated || itemCount === 0 || pathname?.startsWith("/kit")) return null;

  return (
    <button
      type="button"
      aria-label="Open your kit"
      onClick={openDrawer}
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-brand py-3 pr-4 pl-4 text-brand-foreground shadow-[var(--shadow-outta-lg)] transition-transform active:scale-95 sm:hidden"
    >
      <Package className="size-4" />
      <span className="flex flex-col items-start leading-none">
        <span className="text-xs font-semibold tracking-wide">KIT</span>
        <span className="text-[0.6875rem] opacity-80">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </span>
      </span>
    </button>
  );
}

export { FloatingKitButton };

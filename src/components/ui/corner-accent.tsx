import { cn } from "@/lib/utils";

/**
 * OUTTA's small green corner mark — a recurring signature detail (category
 * tiles, product cards) rather than a one-off, so it reads as a brand motif.
 */
function CornerAccent({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("bg-brand/50 absolute right-0 bottom-0 size-4", className)}
      style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
    />
  );
}

export { CornerAccent };

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Tracks which full-width slide is active in a horizontal scroll-snap
 * carousel (one card per screen), from the container's own scroll
 * position — no extra state to keep in sync on swipe.
 */
function useSlideIndex(ref: React.RefObject<HTMLDivElement | null>, count: number) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return;

    let frame = 0;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!el) return;
        const width = el.clientWidth || 1;
        const next = Math.round(el.scrollLeft / width);
        setIndex(Math.min(count - 1, Math.max(0, next)));
      });
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref, count]);

  return index;
}

function scrollToSlide(ref: React.RefObject<HTMLDivElement | null>, index: number) {
  const el = ref.current;
  if (!el) return;
  el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
}

function SlideIndicators({
  count,
  active,
  onSelect,
  className,
}: {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  if (count <= 1) return null;

  return (
    <div role="tablist" aria-label="Slides" className={cn("flex items-center justify-center gap-1.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onSelect?.(i)}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === active ? "w-5 bg-brand" : "w-1.5 bg-foreground/15"
          )}
        />
      ))}
    </div>
  );
}

export { useSlideIndex, scrollToSlide, SlideIndicators };

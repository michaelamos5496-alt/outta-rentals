import * as React from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Cinematic stand-in for real photography/video. Phase 2 has no production
 * imagery yet — this renders a deliberate, on-brand placeholder (grain +
 * gradient + glow) instead of an empty gray box, so layout and rhythm read
 * correctly and can be swapped for real media without touching layout code.
 */

const grainStyle: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
};

export interface MediaPlaceholderProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  /** Small technical caption in the corner, e.g. "16:9 · CAM-042". */
  meta?: string;
  /** Larger, brighter glow — used for hero / full-bleed placements. */
  tone?: "default" | "hero";
  /** Real editorial photography — when set, renders the image instead of the placeholder glow/icon. */
  src?: string;
  alt?: string;
  priority?: boolean;
  /**
   * "cover" (default) fills the frame, cropping as needed — right for the
   * Pexels lifestyle/location stock used across most of the catalogue.
   * "contain" is for real OUTTA-supplied product cutouts with an actual
   * transparent background (alpha channel, not a flat white fill) — the
   * whole item shows uncropped, composited straight onto whatever
   * background the card already has (e.g. the brand-green card fill),
   * no white box around it.
   */
  fit?: "cover" | "contain";
}

function MediaPlaceholder({
  icon: Icon = ImageIcon,
  meta,
  tone = "default",
  src,
  alt = "",
  priority,
  fit = "cover",
  className,
  ...props
}: MediaPlaceholderProps) {
  if (src) {
    const isContain = fit === "contain";
    return (
      <div
        data-slot="media-placeholder"
        className={cn("relative isolate overflow-hidden", !isContain && "bg-card", className)}
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={isContain ? "object-contain p-6" : "object-cover"}
        />
        {!isContain ? <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10" /> : null}
        {meta ? (
          <span
            className={cn(
              "text-meta absolute bottom-3 left-3 drop-shadow-sm",
              isContain ? "!text-foreground/60" : "!text-white/80"
            )}
          >
            {meta}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      data-slot="media-placeholder"
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-card",
        className
      )}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, var(--card) 0%, var(--background) 65%)",
        }}
      />
      <div
        className={cn(
          "absolute rounded-full blur-3xl",
          tone === "hero"
            ? "-top-1/4 -right-1/4 size-[70%] opacity-20"
            : "-bottom-1/3 -right-1/4 size-2/3 opacity-20"
        )}
        style={{ background: "var(--brand)" }}
      />
      <div className="absolute inset-0 mix-blend-overlay opacity-[0.06]" style={grainStyle} />
      <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10" />
      <Icon
        className={cn(
          "relative text-foreground/25",
          tone === "hero"
            ? "hidden size-16 sm:inline-block sm:size-20"
            : "size-7 sm:size-8"
        )}
        strokeWidth={1.25}
        aria-hidden
      />
      {meta ? (
        <span className="text-meta absolute bottom-3 left-3 text-foreground/40">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export { MediaPlaceholder };

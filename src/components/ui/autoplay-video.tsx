"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface AutoplayVideoProps extends React.ComponentProps<"div"> {
  src: string;
  poster: string;
  alt: string;
}

/**
 * Muted, looping video that starts playing once it actually scrolls into
 * view, rather than the moment it mounts — several of these can appear on
 * one page (the /work listing), and eagerly starting every stream on load
 * blocked the page's load event past 30s in testing. `muted` is set as a JS
 * property too, since Safari/iOS only reliably honors autoplay that way.
 */
function AutoplayVideo({ src, poster, alt, className, ...props }: AutoplayVideoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;
    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger once — without disconnecting here, a flickering
        // intersection ratio near the threshold (common during entrance
        // animations) re-fires play() repeatedly, re-requesting the video
        // on every toggle.
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate overflow-hidden bg-card", className)}
      {...props}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={alt}
        className="h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10" />
    </div>
  );
}

export { AutoplayVideo };

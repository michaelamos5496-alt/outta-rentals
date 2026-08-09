"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface AutoplayVideoProps extends React.ComponentProps<"div"> {
  src: string;
  poster: string;
  alt: string;
}

/**
 * Shows a static poster image until the card actually scrolls into view,
 * then swaps in the real <video> element. Mounting a <video> — even with
 * preload="metadata" — fires a network request immediately regardless of
 * scroll position, so with several of these on one page (the homepage,
 * /work) that's several concurrent video requests firing on initial load
 * whether or not the viewer ever scrolls to them. Deferring the mount
 * entirely, not just play(), is what actually stops that.
 */
function AutoplayVideo({ src, poster, alt, className, ...props }: AutoplayVideoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!visible || !video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate overflow-hidden bg-card", className)}
      {...props}
    >
      {visible ? (
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
      ) : (
        <Image
          src={poster}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      )}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10" />
    </div>
  );
}

export { AutoplayVideo };

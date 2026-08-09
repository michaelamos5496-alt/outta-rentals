"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface HoverPlayVideoProps extends React.ComponentProps<"div"> {
  src: string;
  poster: string;
  alt: string;
}

/**
 * Plays a muted preview clip on hover/focus, otherwise shows a static poster
 * frame. Nothing downloads until the viewer actually interacts — some of
 * these clips run 10-25MB, so autoplaying every one on a listing page would
 * be a real page-weight problem.
 */
function HoverPlayVideo({ src, poster, alt, className, ...props }: HoverPlayVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const play = () => videoRef.current?.play().catch(() => {});
  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <div
      className={cn("relative isolate overflow-hidden bg-card", className)}
      onMouseEnter={play}
      onMouseLeave={pause}
      onFocus={play}
      onBlur={pause}
      {...props}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
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

export { HoverPlayVideo };

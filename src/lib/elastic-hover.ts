"use client";

import * as React from "react";
import gsap from "gsap";

/**
 * A restrained elastic hover-scale: GSAP's elastic.out on enter (a quick,
 * small "give"), reversed at a higher timeScale on leave so it snaps back
 * instead of wobbling. Deliberately scoped to bespoke circular action
 * buttons (nav FAB, card quick-add) — NOT the shared <Button> primitive,
 * which is intentionally flat/quiet (see button.tsx's "no shadow, no
 * transform" comment) and shouldn't get this treatment everywhere.
 */
export function useElasticHoverScale<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  scale = 1.12
) {
  const tlRef = React.useRef<gsap.core.Timeline | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ paused: true }).to(el, {
      scale,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
    tlRef.current = tl;
    return () => {
      tl.kill();
    };
  }, [ref, scale]);

  const onMouseEnter = React.useCallback(() => {
    tlRef.current?.timeScale(1).play();
  }, []);
  const onMouseLeave = React.useCallback(() => {
    tlRef.current?.timeScale(2.2).reverse();
  }, []);

  return { onMouseEnter, onMouseLeave };
}

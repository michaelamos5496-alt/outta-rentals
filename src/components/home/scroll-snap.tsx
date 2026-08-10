"use client";

import * as React from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

/**
 * Full-page, wheel/touch-driven section snap for the homepage — each direct
 * child becomes one full-screen slide, transitioning via a slide+fade
 * (outer/inner wrapper offset) rather than native scroll. Adapted from the
 * classic GreenSock "fullpage" pattern, with three departures from the
 * original demo:
 *
 * - No SplitText character-reveal or per-section background parallax —
 *   those assume a fixed "one heading + one background image" markup per
 *   slide, which doesn't match sections built independently of this
 *   (product grids, category tiles, etc). Section content renders unchanged;
 *   only the page-level transition mechanism is new.
 * - Sections taller than the viewport scroll internally within their own
 *   slide instead of being clipped — content wasn't redesigned to fit.
 * - The sequence doesn't wrap infinitely: scrolling past the last slide
 *   disables the Observer and hands off to native scroll so the footer
 *   (outside this component) stays reachable, re-enabling once the user
 *   scrolls back to the top.
 *
 * Disabled entirely under prefers-reduced-motion, falling back to normal
 * stacked document flow.
 */
function ScrollSnap({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<HTMLDivElement[]>([]);
  const outerRefs = React.useRef<HTMLDivElement[]>([]);
  const innerRefs = React.useRef<HTMLDivElement[]>([]);
  const [snapEnabled, setSnapEnabled] = React.useState(false);

  const items = React.Children.toArray(children);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !containerRef.current) return;

    setSnapEnabled(true);

    const sections = sectionRefs.current;
    const outers = outerRefs.current;
    const inners = innerRefs.current;
    const count = sections.length;
    if (count === 0) return;

    let currentIndex = -1;
    let animating = false;
    let observerEnabled = true;

    gsap.set(sections, { autoAlpha: 0, zIndex: 0 });
    gsap.set(outers, { yPercent: 100 });
    gsap.set(inners, { yPercent: -100 });

    function gotoSection(index: number, direction: 1 | -1) {
      const wrapped = gsap.utils.wrap(0, count)(index);
      animating = true;
      const fromTop = direction === -1;
      const dFactor = fromTop ? -1 : 1;

      const tl = gsap.timeline({
        defaults: { duration: 1, ease: "power1.inOut" },
        onComplete: () => {
          animating = false;
        },
      });

      if (currentIndex >= 0) {
        gsap.set(sections[currentIndex], { zIndex: 0 });
        tl.set(sections[currentIndex], { autoAlpha: 0 });
      }
      gsap.set(sections[wrapped], { autoAlpha: 1, zIndex: 1 });
      tl.fromTo(
        [outers[wrapped], inners[wrapped]],
        { yPercent: (i: number) => (i ? -100 * dFactor : 100 * dFactor) },
        { yPercent: 0 },
        0
      );

      currentIndex = wrapped;
    }

    gotoSection(0, 1);

    const observer = Observer.create({
      target: containerRef.current,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onDown: () => {
        if (animating) return;
        if (currentIndex === 0) return; // nothing above the first slide
        gotoSection(currentIndex - 1, -1);
      },
      onUp: () => {
        if (animating) return;
        if (currentIndex === count - 1) {
          // Release control at the last slide so native scroll can reach the footer.
          observer.disable();
          observerEnabled = false;
          return;
        }
        gotoSection(currentIndex + 1, 1);
      },
    });

    function handleWindowScroll() {
      if (!observerEnabled && window.scrollY <= 0) {
        observer.enable();
        observerEnabled = true;
      }
    }
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      observer.kill();
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-scroll-snap-container
      data-snap-enabled={snapEnabled}
      className={snapEnabled ? "relative h-svh w-full overflow-hidden" : undefined}
    >
      {items.map((child, i) => (
        <div
          key={i}
          data-scroll-snap-section={i}
          ref={(el) => {
            if (el) sectionRefs.current[i] = el;
          }}
          className={snapEnabled ? "invisible absolute inset-0 h-svh w-full" : undefined}
        >
          <div
            ref={(el) => {
              if (el) outerRefs.current[i] = el;
            }}
            className={snapEnabled ? "absolute inset-0 h-full w-full overflow-hidden" : undefined}
          >
            <div
              ref={(el) => {
                if (el) innerRefs.current[i] = el;
              }}
              className={snapEnabled ? "absolute inset-0 h-full w-full overflow-y-auto" : undefined}
            >
              {child}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { ScrollSnap };

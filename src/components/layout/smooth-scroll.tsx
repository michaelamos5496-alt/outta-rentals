"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
}

/**
 * Sitewide eased/momentum scrolling (GSAP ScrollSmoother) — every page
 * except the homepage, which owns its own hero video/motion treatment and
 * is left on native scroll. Disabled under prefers-reduced-motion.
 *
 * The navbar stays a sibling outside this wrapper: it's `position: sticky`,
 * which doesn't work correctly inside ScrollSmoother's transformed content
 * (sticky needs a real scrolling container; ScrollSmoother simulates scroll
 * via `transform` instead) — same reason the kit drawer/floating button
 * (both `position: fixed`) stay outside too, since `fixed` inside a
 * transformed ancestor is repositioned relative to that ancestor, not the
 * viewport.
 */
function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const smootherRef = React.useRef<ScrollSmoother | null>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      // Well above GSAP's default (1) — on a trackpad, which already has its
      // own native momentum, anything close to the default reads as identical
      // to plain scrolling. This is deliberately pronounced enough to feel
      // distinct from native momentum on any input device.
      smooth: 2.2,
      effects: false,
      // normalizeScroll caused a real bug on touch: native scroll (window.scrollY)
      // moved but the content transform never updated, so the page visually froze
      // while actually scrolling underneath — confirmed via a real touch-drag test.
    });

    return () => {
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, []);

  // Recompute content height on client-side navigation between pages of
  // different lengths — the smoother instance itself persists across route
  // changes since this component doesn't unmount while off the homepage.
  React.useEffect(() => {
    smootherRef.current?.refresh();
  }, [pathname]);

  // ScrollSmoother moves the content with a transform, so the browser's own
  // jump to a #section link doesn't land. Scroll there ourselves — on arrival
  // and whenever the hash changes — clearing the sticky navbar. Repeated
  // briefly in case the content above it is still settling.
  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const goToHash = (hash = window.location.hash) => {
      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;
      const jump = () => {
        const target = document.getElementById(id);
        if (!target) return;
        const smoother = smootherRef.current;
        if (smoother) {
          smoother.refresh();
          smoother.scrollTo(target, false, "top 88px");
        } else {
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 88 });
        }
      };
      [0, 150, 600].forEach((delay) => timers.push(setTimeout(jump, delay)));
    };
    // Next.js updates the URL for same-page #links without a hashchange event.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname === window.location.pathname && url.hash) goToHash(url.hash);
    };
    const onHashChange = () => goToHash();
    goToHash();
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}

export { SmoothScroll };

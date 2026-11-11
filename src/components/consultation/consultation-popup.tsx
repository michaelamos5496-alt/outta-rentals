"use client";

import * as React from "react";
import { MessageCircleQuestion } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { ConsultationRequestForm } from "@/components/consultation/consultation-request-form";

const AUTO_OPEN_DELAY_MS = 5000;
const SEEN_KEY = "outta-consultation-seen";

function hasSeenThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeenThisSession() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage unavailable (private mode) — the popup may auto-open again next load.
  }
}

function isTyping(): boolean {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}

/**
 * Opens itself 5s after the site loads to invite a consultation request —
 * once per browser session, and never while the visitor is typing in a field.
 * Once dismissed (in either direction) it collapses into a floating button.
 * On mobile it's a round icon FAB in the same spot (and same size/shape)
 * as the nav's contact FAB, which is hidden on mobile in its favor — one
 * floating action, not two. Desktop keeps both, so there it stays the
 * labeled pill on the opposite corner from the nav FAB.
 */
function ConsultationPopup() {
  const [open, setOpen] = React.useState(false);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShown(true);
      if (hasSeenThisSession() || isTyping()) return;
      markSeenThisSession();
      setOpen(true);
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {shown && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Request a consultation"
          className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-xl transition-transform hover:scale-105 lg:left-6 lg:right-auto lg:bottom-6 lg:size-auto lg:justify-start lg:gap-2 lg:border lg:border-white/40 lg:bg-white/35 lg:py-3 lg:pr-4 lg:pl-3 lg:text-foreground lg:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.25)] lg:backdrop-blur-xl lg:backdrop-saturate-150"
        >
          <MessageCircleQuestion
            className="size-5 shrink-0 text-brand-foreground lg:text-brand"
            strokeWidth={2}
            aria-hidden
          />
          <span className="hidden text-sm font-medium whitespace-nowrap lg:inline">Request Consultation</span>
        </button>
      ) : null}

      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setShown(true);
        }}
        title="Request a consultation"
        description="Talk through your shoot with OUTTA's team before you commit to a kit — no charge, no obligation."
        className="rounded-[28px] border border-white/50 bg-white/45 shadow-[0_8px_40px_-4px_rgba(0,0,0,0.3)] ring-1 ring-white/60 backdrop-blur-2xl backdrop-saturate-150 sm:max-w-lg"
      >
        <ConsultationRequestForm />
      </Modal>
    </>
  );
}

export { ConsultationPopup };

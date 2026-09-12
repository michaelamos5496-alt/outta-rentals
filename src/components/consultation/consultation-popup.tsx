"use client";

import * as React from "react";
import { MessageCircleQuestion } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { ConsultationRequestForm } from "@/components/consultation/consultation-request-form";

const AUTO_OPEN_DELAY_MS = 5000;

/**
 * Opens itself 5s after the site loads to invite a consultation request.
 * Once dismissed (in either direction) it collapses into a floating button
 * — fixed opposite the nav FAB so a customer can reopen it whenever
 * they're ready, instead of only getting the one auto-prompt.
 */
function ConsultationPopup() {
  const [open, setOpen] = React.useState(false);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
      setShown(true);
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
          className="fixed left-4 bottom-24 z-40 flex items-center gap-2 rounded-full bg-brand py-3 pr-4 pl-3 text-brand-foreground shadow-xl transition-transform hover:scale-105 lg:left-6 lg:bottom-6"
        >
          <MessageCircleQuestion className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="text-sm font-medium whitespace-nowrap">Request Consultation</span>
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
        className="sm:max-w-lg"
      >
        <ConsultationRequestForm />
      </Modal>
    </>
  );
}

export { ConsultationPopup };

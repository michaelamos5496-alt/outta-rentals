"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Truck, Undo2, UserCheck, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import {
  markPickedUpAction,
  markReturnedAction,
  undoTimelineStepAction,
} from "@/lib/admin/actions";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import { daysBetween, plural, reminderMessage, rentalStage } from "@/lib/admin/rental";
import type { AdminQuote } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "late" | "todo";

function Step({
  state,
  title,
  detail,
  last,
  children,
}: {
  state: StepState;
  title: string;
  detail?: React.ReactNode;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last ? (
        <span
          aria-hidden
          className={cn(
            "absolute top-6 left-[11px] h-[calc(100%-1.5rem)] w-0.5",
            state === "done" ? "bg-brand" : "bg-border"
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
          state === "done" && "border-brand bg-brand text-brand-foreground",
          state === "current" && "border-brand bg-background",
          state === "late" && "border-destructive bg-destructive/10",
          state === "todo" && "border-border bg-background"
        )}
      >
        {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : null}
        {state === "current" ? <span className="size-2 rounded-full bg-brand" /> : null}
        {state === "late" ? <span className="size-2 rounded-full bg-destructive" /> : null}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className={cn("text-sm font-medium", state === "late" && "text-destructive")}>{title}</p>
        {detail ? <div className="text-small mt-0.5">{detail}</div> : null}
        {children ? <div className="mt-2 flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </li>
  );
}

/**
 * Confirmed → picked up/delivered → out → due back → returned, with one tap
 * per real-world step and ready-written WhatsApp reminders to the customer.
 */
function RentalTimeline({ quote, today }: { quote: AdminQuote; today: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const stage = rentalStage(quote, today);
  if (!stage || !quote.startDate || !quote.endDate) return null;

  const start = quote.startDate.slice(0, 10);
  const end = quote.endDate.slice(0, 10);
  const pickedUp = Boolean(quote.pickedUpAt);
  const returned = Boolean(quote.returnedAt);
  const delivered = quote.deliveryMethod === "delivery";
  const totalDays = daysBetween(start, end) + 1;

  async function run(key: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(key);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Something went wrong. Please try again.");
      else router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const pickupReminder = !pickedUp ? reminderMessage(quote, "pickup", today) : null;
  const returnReminder = pickedUp && !returned ? reminderMessage(quote, "return", today) : null;

  return (
    <section>
      <p className="text-label mb-3">Rental timeline</p>
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        <ol>
          <Step state="done" title="Confirmed" detail={`Booked ${formatDate(start)} → ${formatDate(end)}`} />

          <Step
            state={pickedUp ? "done" : stage === "pickup_late" ? "late" : stage === "pickup_today" ? "current" : "todo"}
            title={pickedUp ? (delivered ? "Delivered" : "Picked up") : "Pickup / delivery"}
            detail={
              pickedUp
                ? formatDateTime(quote.pickedUpAt!)
                : stage === "pickup_late"
                  ? `Was due ${formatDate(start)} — ${plural(daysBetween(start, today), "day")} ago`
                  : stage === "pickup_today"
                    ? "Due today"
                    : `Due ${formatDate(start)}`
            }
          >
            {!pickedUp ? (
              <>
                <Button size="sm" disabled={busy !== null} onClick={() => run("pickup", () => markPickedUpAction(quote.id, "pickup"))}>
                  {busy === "pickup" ? <LoaderCircle className="animate-spin" /> : <UserCheck />}
                  Mark picked up
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => run("delivery", () => markPickedUpAction(quote.id, "delivery"))}
                >
                  {busy === "delivery" ? <LoaderCircle className="animate-spin" /> : <Truck />}
                  Mark delivered
                </Button>
              </>
            ) : null}
          </Step>

          <Step
            state={returned ? "done" : pickedUp && stage === "out" ? "current" : pickedUp ? "done" : "todo"}
            title="Out on rental"
            detail={
              pickedUp && !returned && stage === "out"
                ? `Day ${Math.min(daysBetween(start, today) + 1, totalDays)} of ${totalDays}`
                : `${totalDays} day${totalDays === 1 ? "" : "s"}`
            }
          />

          <Step
            state={returned ? "done" : stage === "overdue" ? "late" : stage === "due_today" ? "current" : "todo"}
            title={stage === "overdue" ? "Overdue" : "Due back"}
            detail={
              stage === "overdue"
                ? `Was due ${formatDate(end)} — ${plural(daysBetween(end, today), "day")} late`
                : stage === "due_today"
                  ? "Due back today"
                  : formatDate(end)
            }
          />

          <Step
            last
            state={returned ? "done" : "todo"}
            title="Returned"
            detail={returned ? formatDateTime(quote.returnedAt!) : "Not yet"}
          >
            {pickedUp && !returned ? (
              <Button size="sm" disabled={busy !== null} onClick={() => run("return", () => markReturnedAction(quote.id))}>
                {busy === "return" ? <LoaderCircle className="animate-spin" /> : <PackageCheck />}
                Mark returned
              </Button>
            ) : null}
          </Step>
        </ol>

        {pickupReminder || returnReminder || pickedUp ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {quote.customerPhone && pickupReminder ? (
              <WhatsAppButton
                to={quote.customerPhone}
                message={pickupReminder}
                label="Send pickup reminder"
                size="sm"
                variant="outline"
              />
            ) : null}
            {quote.customerPhone && returnReminder ? (
              <WhatsAppButton
                to={quote.customerPhone}
                message={returnReminder}
                label={stage === "overdue" ? "Send overdue reminder" : "Send return reminder"}
                size="sm"
                variant="outline"
              />
            ) : null}
            {!quote.customerPhone && (pickupReminder || returnReminder) ? (
              <p className="text-small">No phone number on this order — remind them in the WhatsApp chat.</p>
            ) : null}
            {pickedUp ? (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-muted-foreground"
                disabled={busy !== null}
                onClick={() => run("undo", () => undoTimelineStepAction(quote.id))}
              >
                {busy === "undo" ? <LoaderCircle className="animate-spin" /> : <Undo2 />}
                Undo last step
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { RentalTimeline };

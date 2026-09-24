"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quoteStatusLabels, quoteStatuses } from "@/components/admin/quote-status-badge";
import { WhatsAppButton } from "@/components/quote/whatsapp-button";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import {
  addQuoteNoteAction,
  updateQuoteDatesAction,
  updateQuoteStatusAction,
} from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/admin/format";
import type { AdminQuote, AdminQuoteStatus } from "@/lib/admin/types";

function QuoteDetailActions({ quote }: { quote: AdminQuote }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<AdminQuoteStatus>(quote.status);
  const [noteText, setNoteText] = React.useState("");
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [conflicts, setConflicts] = React.useState<string[]>([]);
  const [startDate, setStartDate] = React.useState(quote.startDate.slice(0, 10));
  const [endDate, setEndDate] = React.useState(quote.endDate.slice(0, 10));
  const [savingDates, setSavingDates] = React.useState(false);
  const [datesSaved, setDatesSaved] = React.useState(false);
  const confirmed = status === "confirmed";

  async function handleStatusChange(next: string) {
    const previous = status;
    setStatus(next as AdminQuoteStatus);
    setSavingStatus(true);
    setError(null);
    setConflicts([]);
    try {
      const result = await updateQuoteStatusAction(quote.id, next as AdminQuoteStatus);
      if (!result.ok) {
        setStatus(previous);
        if (result.error === "conflict") {
          setError("Can't confirm — some equipment is already booked for these dates:");
          setConflicts(
            result.conflicts.map(
              (c) =>
                `${c.productName}: needs ${c.requested}, ${c.available} free`
            )
          );
        } else if (result.error === "no_dates") {
          setError("Add rental dates below before confirming.");
        } else {
          setError("Couldn't update the status. Please try again.");
        }
        return;
      }
      router.refresh();
    } catch {
      setStatus(previous);
      setError("Couldn't update the status. Please try again.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveDates(e: React.FormEvent) {
    e.preventDefault();
    setSavingDates(true);
    setError(null);
    setDatesSaved(false);
    try {
      const result = await updateQuoteDatesAction(quote.id, startDate, endDate);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDatesSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't save the dates. Please try again.");
    } finally {
      setSavingDates(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    setError(null);
    try {
      await addQuoteNoteAction(quote.id, noteText);
      setNoteText("");
      router.refresh();
    } catch {
      setError("Couldn't save the note. Please try again.");
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div className="text-sm text-destructive">
          <p>{error}</p>
          {conflicts.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {conflicts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div>
        <p className="text-label mb-2">Status</p>
        <Select value={status} onValueChange={handleStatusChange} disabled={savingStatus}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {quoteStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {quoteStatusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-muted-foreground">
          {confirmed
            ? "Equipment is booked for these dates. Change the status to free them."
            : "Confirming books this equipment for the order's dates."}
        </p>
      </div>

      <form onSubmit={handleSaveDates}>
        <p className="text-label mb-2">Rental dates</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="quote-start" className="text-xs">
              Start
            </Label>
            <Input
              id="quote-start"
              type="date"
              value={startDate}
              disabled={confirmed}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatesSaved(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="quote-end" className="text-xs">
              End
            </Label>
            <Input
              id="quote-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              disabled={confirmed}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatesSaved(false);
              }}
            />
          </div>
        </div>
        {!confirmed ? (
          <div className="mt-2 flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={savingDates || !startDate || !endDate}
            >
              {savingDates ? <LoaderCircle className="animate-spin" /> : null}
              Save dates
            </Button>
            {datesSaved ? <span className="text-meta">Saved</span> : null}
          </div>
        ) : null}
      </form>

      <div>
        <p className="text-label mb-2">Contact customer</p>
        <div className="flex flex-col gap-2">
          {quote.customerEmail ? (
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={`mailto:${quote.customerEmail}`}>
                <Mail /> {quote.customerEmail}
              </a>
            </Button>
          ) : null}
          {quote.customerPhone ? (
            <WhatsAppButton
              label={`Message ${quote.customerName.split(" ")[0] || "customer"} on WhatsApp`}
              to={quote.customerPhone}
              heading="OUTTA RENTALS — YOUR KIT REQUEST"
              items={quote.kit.map((k) => ({ name: k.productName, quantity: k.quantity }))}
              startDate={quote.startDate || undefined}
              endDate={quote.endDate || undefined}
              projectLabel={quote.projectName}
              location={quote.shootLocation}
              closingLine="Following up on your OUTTA kit request."
              variant="outline"
              className="w-full justify-start"
            />
          ) : null}
          {!quote.customerEmail && !quote.customerPhone ? (
            <p className="text-small">
              No contact details on this request — reply from the WhatsApp chat it came in on.
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-label mb-2">Notes</p>
        <div className="flex flex-col gap-3">
          {quote.notes.length === 0 ? (
            <p className="text-small">No notes yet.</p>
          ) : (
            quote.notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border p-3 text-sm">
                <p>{note.text}</p>
                <p className="text-meta mt-1.5">{formatDateTime(note.createdAt)}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleAddNote} className="mt-3 flex flex-col gap-2">
          <Textarea
            rows={3}
            placeholder="Add an internal note…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={savingNote} className="self-start">
            {savingNote ? <LoaderCircle className="animate-spin" /> : null}
            Add note
          </Button>
        </form>
      </div>

      <div className="border-t border-border pt-4">
        <DeleteOrderButton id={quote.id} confirmed={status === "confirmed"} />
      </div>
    </div>
  );
}

export { QuoteDetailActions };

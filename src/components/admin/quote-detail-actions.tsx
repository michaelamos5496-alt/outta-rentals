"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { updateQuoteStatusAction, addQuoteNoteAction } from "@/lib/admin/actions";
import type { AdminQuote, AdminQuoteStatus } from "@/lib/admin/types";

function QuoteDetailActions({ quote }: { quote: AdminQuote }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<AdminQuoteStatus>(quote.status);
  const [noteText, setNoteText] = React.useState("");
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleStatusChange(next: string) {
    const previous = status;
    setStatus(next as AdminQuoteStatus);
    setSavingStatus(true);
    setError(null);
    try {
      await updateQuoteStatusAction(quote.id, next as AdminQuoteStatus);
      router.refresh();
    } catch {
      setStatus(previous);
      setError("Couldn't update the status. Please try again.");
    } finally {
      setSavingStatus(false);
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
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
      </div>

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
                <p className="text-meta mt-1.5">{new Date(note.createdAt).toLocaleString()}</p>
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
    </div>
  );
}

export { QuoteDetailActions };

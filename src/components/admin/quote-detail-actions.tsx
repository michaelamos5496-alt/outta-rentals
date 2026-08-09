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

  async function handleStatusChange(next: string) {
    setStatus(next as AdminQuoteStatus);
    setSavingStatus(true);
    await updateQuoteStatusAction(quote.id, next as AdminQuoteStatus);
    router.refresh();
    setSavingStatus(false);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    await addQuoteNoteAction(quote.id, noteText);
    setNoteText("");
    router.refresh();
    setSavingNote(false);
  }

  return (
    <div className="flex flex-col gap-6">
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
          <Button asChild variant="outline" className="w-full justify-start">
            <a href={`mailto:${quote.customerEmail}`}>
              <Mail /> {quote.customerEmail}
            </a>
          </Button>
          <WhatsAppButton
            label={`Message ${quote.customerName.split(" ")[0]} on WhatsApp`}
            items={quote.kit.map((k) => ({ name: k.productName, quantity: k.quantity }))}
            startDate={quote.startDate}
            endDate={quote.endDate}
            projectLabel={quote.projectName}
            location={quote.shootLocation}
            closingLine="Following up on your OUTTA quote request."
            variant="outline"
            className="w-full justify-start"
          />
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

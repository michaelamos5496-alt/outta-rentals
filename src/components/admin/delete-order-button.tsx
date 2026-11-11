"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteQuoteAction } from "@/lib/admin/actions";

/** Permanently deletes an order after a confirmation step. */
function DeleteOrderButton({
  id,
  confirmed,
  backHref,
  label,
  compact = false,
}: {
  id: string;
  confirmed: boolean;
  /** Where to go after deleting (from the order's own page); omit to stay on a list. */
  backHref?: string;
  /** Names the order in the icon button's accessible label. */
  label?: string;
  /** Icon-only button for list rows. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const ok = await deleteQuoteAction(id).catch(() => false);
    if (ok) {
      setOpen(false);
      setDeleting(false);
      if (backHref) router.push(backHref);
      router.refresh();
    } else {
      setError("Couldn't delete the order. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {compact ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label ? `Delete ${label}` : "Delete"}
          title="Delete"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Trash2 />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          <Trash2 /> Delete order
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {label ? `“${label}”` : "this order"}?</DialogTitle>
          <DialogDescription>
            It will be removed permanently, with its notes
            {confirmed ? ", and its booked dates will become available again" : ""}. This can&rsquo;t be
            undone — download a spreadsheet from Quotes first if you want to keep a copy.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleting}>
              Keep order
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteOrderButton };

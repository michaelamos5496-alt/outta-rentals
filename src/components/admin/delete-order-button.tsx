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
}: {
  id: string;
  confirmed: boolean;
  backHref: string;
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
      router.push(backHref);
      router.refresh();
    } else {
      setError("Couldn't delete the order. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 /> Delete order
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this order?</DialogTitle>
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

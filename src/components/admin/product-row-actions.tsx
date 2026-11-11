"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteProductAction, setProductArchivedAction } from "@/lib/admin/actions";

function ProductRowActions({ id, archived }: { id: string; archived: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleArchiveToggle() {
    setBusy(true);
    await setProductArchivedAction(id, !archived);
    router.refresh();
    setBusy(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this product? This can't be undone.")) return;
    setBusy(true);
    await deleteProductAction(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={archived ? "Unarchive" : "Archive"}
        disabled={busy}
        onClick={handleArchiveToggle}
        title={archived ? "Unarchive" : "Archive"}
      >
        {archived ? <ArchiveRestore /> : <Archive />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete"
        disabled={busy}
        onClick={handleDelete}
        title="Delete"
        className="hover:text-destructive"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

export { ProductRowActions };

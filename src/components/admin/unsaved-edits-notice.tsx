import { TriangleAlert } from "lucide-react";

import { catalogueEditable } from "@/lib/admin/catalogue-editing";

/**
 * Products and categories still live in the in-memory admin store, not the
 * database (see `catalogue-editing.ts`) — so they're view-only on the live
 * site, and edits in development are flagged as temporary.
 */
function UnsavedEditsNotice() {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" />
      {catalogueEditable
        ? "Development only: changes here aren\u2019t saved and reset when the server restarts."
        : "View-only. Adding or editing equipment and categories isn\u2019t available here yet \u2014 use Inventory to change an item\u2019s status or units owned."}
    </p>
  );
}

export { UnsavedEditsNotice };

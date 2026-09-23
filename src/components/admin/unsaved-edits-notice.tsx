import { TriangleAlert } from "lucide-react";

/**
 * Products, stock and categories still live in the in-memory admin store
 * (`src/lib/admin/store.ts`), not the database — say so plainly so edits
 * made here aren't mistaken for permanent ones.
 */
function UnsavedEditsNotice() {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-brand" />
      Changes here aren&rsquo;t saved permanently yet — they reset whenever the site restarts or
      redeploys. Orders and customers are saved.
    </p>
  );
}

export { UnsavedEditsNotice };

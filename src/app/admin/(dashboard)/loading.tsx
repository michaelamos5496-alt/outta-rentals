import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly while an admin page loads its data, so clicks and
// refreshes respond straight away instead of sitting on the old page.
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-8 h-72 rounded-2xl" />
    </div>
  );
}

import { CalendarX2 } from "lucide-react";

import type { BookedRange } from "@/lib/catalogue/db";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Accra",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatRange({ start, end }: BookedRange): string {
  const s = fmt.format(new Date(`${start}T00:00:00Z`));
  const e = fmt.format(new Date(`${end}T00:00:00Z`));
  return start === end ? s : `${s} – ${e}`;
}

/** Upcoming dates this item is fully booked — shown so customers pick free dates. */
function BookedDates({ ranges }: { ranges: BookedRange[] }) {
  if (ranges.length === 0) return null;
  return (
    <div className="mt-6 rounded-xl border border-border p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CalendarX2 className="size-4 text-destructive" /> Already booked on these dates
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {ranges.map((range) => (
          <li
            key={range.start}
            className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
          >
            {formatRange(range)}
          </li>
        ))}
      </ul>
      <p className="text-small mt-2">Any other dates are open — pick them in your kit.</p>
    </div>
  );
}

export { BookedDates };

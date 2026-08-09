"use client";

import { AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { todayIso } from "@/lib/kit/rental";
import { useKit } from "@/components/kit/kit-provider";

function RentalDates() {
  const { startDate, endDate, rentalDays, dateError, setStartDate, setEndDate } = useKit();

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-label">Start date</span>
          <Input
            type="date"
            min={todayIso()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-label">End date</span>
          <Input
            type="date"
            min={startDate || todayIso()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {dateError ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {dateError}
        </p>
      ) : (
        <p className="text-small mt-2.5">
          {rentalDays} rental day{rentalDays === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

export { RentalDates };

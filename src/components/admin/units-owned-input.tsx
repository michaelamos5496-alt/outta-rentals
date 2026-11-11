"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { setProductUnitsAction } from "@/lib/admin/actions";

/** Units OUTTA owns of one item — saved to the database when the field loses focus. */
function UnitsOwnedInput({
  slug,
  value,
  disabled,
}: {
  slug: string;
  value: number;
  disabled?: boolean;
}) {
  const [units, setUnits] = React.useState(String(value));
  const [saved, setSaved] = React.useState(value);
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    const next = Number(units);
    if (!Number.isInteger(next) || next < 0 || next > 999) {
      setUnits(String(saved));
      return;
    }
    if (next === saved) return;
    setState("saving");
    const ok = await setProductUnitsAction(slug, next).catch(() => false);
    if (ok) {
      setSaved(next);
      setState("saved");
    } else {
      setUnits(String(saved));
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={999}
        aria-label="Units owned"
        className="h-8 w-20"
        value={units}
        disabled={disabled || state === "saving"}
        onChange={(e) => {
          setUnits(e.target.value);
          setState("idle");
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {state === "saved" ? <span className="text-meta">Saved</span> : null}
      {state === "error" ? <span className="text-xs text-destructive">Not saved</span> : null}
    </div>
  );
}

export { UnitsOwnedInput };

import * as React from "react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface DividerProps extends React.ComponentProps<typeof Separator> {
  label?: string;
}

/** Thin semantic wrapper around Separator, with an optional centered label. */
function Divider({ className, label, orientation = "horizontal", ...props }: DividerProps) {
  if (!label) {
    return <Separator orientation={orientation} className={className} {...props} />;
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Separator orientation={orientation} className="flex-1" {...props} />
      <span className="text-label">{label}</span>
      <Separator orientation={orientation} className="flex-1" {...props} />
    </div>
  );
}

export { Divider };

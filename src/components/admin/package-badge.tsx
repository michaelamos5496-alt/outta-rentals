import { Badge } from "@/components/ui/badge";

/** Marks an order that contains an equipment package. */
function PackageBadge({ className }: { className?: string }) {
  return (
    <Badge variant="brand" className={className}>
      PACKAGE
    </Badge>
  );
}

export { PackageBadge };

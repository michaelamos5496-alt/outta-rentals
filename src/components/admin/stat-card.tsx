import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-label">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-h2 mt-2">{value}</p>
      {hint ? <p className="text-meta mt-1">{hint}</p> : null}
    </div>
  );
}

export { StatCard };

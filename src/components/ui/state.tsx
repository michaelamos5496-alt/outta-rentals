import * as React from "react";
import { AlertTriangle, Inbox, LoaderCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Loading state                                                      */
/* ------------------------------------------------------------------ */

export interface LoadingStateProps extends React.ComponentProps<"div"> {
  label?: string;
}

function LoadingState({ className, label = "Loading", ...props }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className
      )}
      {...props}
    >
      <LoaderCircle className="size-5 animate-spin text-brand" aria-hidden />
      <span className="text-label">{label}</span>
    </div>
  );
}

/** Skeleton grid for catalogue-style layouts — placeholder cards while data loads. */
function LoadingGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-4/3 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                        */
/* ------------------------------------------------------------------ */

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center",
        className
      )}
      {...props}
    >
      <Icon className="size-6 text-muted-foreground" aria-hidden />
      <p className="text-h3 text-balance">{title}</p>
      {description ? (
        <p className="text-small max-w-sm text-balance">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Error state                                                        */
/* ------------------------------------------------------------------ */

export interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

function ErrorState({
  title = "Something went wrong",
  description = "That didn't load correctly. Try again in a moment.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-20 text-center",
        className
      )}
      {...props}
    >
      <AlertTriangle className="size-6 text-destructive" aria-hidden />
      <p className="text-h3 text-balance">{title}</p>
      <p className="text-small max-w-sm text-balance">{description}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export { LoadingState, LoadingGrid, EmptyState, ErrorState };

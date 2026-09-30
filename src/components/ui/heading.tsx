import * as React from "react";

import { cn } from "@/lib/utils";

const levelStyles = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
} as const;

type Level = keyof typeof levelStyles;

const defaultTag: Record<Level, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

export interface HeadingProps extends React.ComponentProps<"h1"> {
  level?: Level;
  as?: React.ElementType;
  /** Small tracked label rendered above the heading, e.g. "EQUIPMENT". */
  eyebrow?: React.ReactNode;
  /** Overrides for the eyebrow's own classes, e.g. a different font size. */
  eyebrowClassName?: string;
}

function Heading({
  level = "h2",
  as,
  eyebrow,
  eyebrowClassName,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = as ?? defaultTag[level];

  return (
    <div data-slot="heading-group">
      {eyebrow ? (
        <p className={cn("text-label mb-3 text-brand", eyebrowClassName)}>{eyebrow}</p>
      ) : null}
      <Tag
        data-slot="heading"
        className={cn(levelStyles[level], "text-balance", className)}
        {...props}
      >
        {children}
      </Tag>
    </div>
  );
}

export { Heading };

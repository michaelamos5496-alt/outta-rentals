import * as React from "react";

import { cn } from "@/lib/utils";
import { Container, type ContainerProps } from "@/components/ui/container";

const spacingMap = {
  default: "py-20 sm:py-28 lg:py-32",
  compact: "py-12 sm:py-16",
  none: "",
} as const;

export interface SectionProps extends React.ComponentProps<"section"> {
  spacing?: keyof typeof spacingMap;
  containerWidth?: ContainerProps["width"];
  /** Skip the inner Container when the section needs full-bleed content. */
  bleed?: boolean;
}

function Section({
  className,
  spacing = "default",
  containerWidth = "default",
  bleed = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(spacingMap[spacing], className)}
      {...props}
    >
      {bleed ? children : <Container width={containerWidth}>{children}</Container>}
    </section>
  );
}

export { Section };

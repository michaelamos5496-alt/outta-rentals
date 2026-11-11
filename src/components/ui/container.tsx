import * as React from "react";

import { cn } from "@/lib/utils";

const widthMap = {
  default: "max-w-(--container-content)",
  narrow: "max-w-(--container-narrow)",
  full: "max-w-none",
} as const;

export interface ContainerProps extends React.ComponentProps<"div"> {
  width?: keyof typeof widthMap;
}

function Container({ className, width = "default", ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", widthMap[width], className)}
      {...props}
    />
  );
}

export { Container };

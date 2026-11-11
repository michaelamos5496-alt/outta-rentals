"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);

  return (
    <Container className="py-24">
      <ErrorState
        title="Something went wrong"
        description="This page hit an unexpected error. You can try again, or head back home."
        onRetry={reset}
      />
      <div className="mt-4 flex justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </Container>
  );
}

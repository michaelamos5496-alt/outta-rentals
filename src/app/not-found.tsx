import Link from "next/link";
import { Compass } from "lucide-react";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-24">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">Back home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/equipment">Browse equipment</Link>
            </Button>
          </div>
        }
      />
    </Container>
  );
}

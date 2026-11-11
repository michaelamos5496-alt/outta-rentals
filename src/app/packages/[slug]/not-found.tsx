import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

export default function PackageNotFound() {
  return (
    <Container className="py-20">
      <EmptyState
        title="Package not found"
        description="We couldn't find that package."
        action={
          <Button asChild variant="outline">
            <Link href="/packages">Browse packages</Link>
          </Button>
        }
      />
    </Container>
  );
}

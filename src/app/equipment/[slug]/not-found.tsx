import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

export default function EquipmentNotFound() {
  return (
    <Container className="py-20">
      <EmptyState
        title="Equipment not found"
        description="We couldn't find that equipment. It may have been renamed or is no longer listed."
        action={
          <Button asChild variant="outline">
            <Link href="/equipment">Browse all equipment</Link>
          </Button>
        }
      />
    </Container>
  );
}

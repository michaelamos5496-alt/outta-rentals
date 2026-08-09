import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <Container className="py-10 sm:py-14">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-4/3 w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </Container>
  );
}

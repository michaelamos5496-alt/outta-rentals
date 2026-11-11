import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function PackageLoading() {
  return (
    <Container className="py-14">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-3 h-10 w-2/3" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </Container>
  );
}

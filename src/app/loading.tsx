import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/Container";

export default function RootLoading() {
  return (
    <Container className="flex flex-col gap-6 py-8" aria-live="polite" aria-busy="true">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </Container>
  );
}

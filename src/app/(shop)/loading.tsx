import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8" aria-live="polite" aria-busy="true">
      <aside className="hidden w-64 shrink-0 lg:block">
        <Skeleton className="sticky top-24 h-64 rounded-lg" />
      </aside>
      <div className="min-w-0 flex-1 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

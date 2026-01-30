import { Skeleton } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <div className="flex flex-col gap-6 md:flex-row" aria-live="polite" aria-busy="true">
      <aside className="w-full shrink-0 md:w-56">
        <Skeleton className="h-64 rounded-lg" />
      </aside>
      <div className="min-w-0 flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

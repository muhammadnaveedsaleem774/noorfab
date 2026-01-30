import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
      aria-live="polite"
      aria-busy="true"
    >
      <Skeleton className="h-12 w-64 rounded-lg" />
      <Skeleton className="h-10 w-72 rounded-lg" />
      <Skeleton className="h-10 w-72 rounded-lg" />
      <Skeleton className="h-11 w-48 rounded-lg" />
    </div>
  );
}

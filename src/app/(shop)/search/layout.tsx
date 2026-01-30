import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Search | AL-NOOR",
  description: "Search AL-NOOR clothing and collections. Find premium cotton, linen, lawn and ready-to-wear pieces.",
  openGraph: {
    title: "Search | AL-NOOR",
    description: "Search AL-NOOR clothing and collections.",
  },
};

function SearchFallback() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="h-64 w-full shrink-0 animate-pulse rounded-lg bg-muted lg:w-[20%]" />
      <div className="min-w-0 flex-1 space-y-4">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<SearchFallback />}>{children}</Suspense>;
}

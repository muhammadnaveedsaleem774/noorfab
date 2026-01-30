"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ShopError]", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="alert"
    >
      <AlertCircle className="h-14 w-14 text-[#C4A747]" aria-hidden />
      <h2 className="mt-4 text-xl font-bold text-[#333333]">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">Please try again or browse our collections.</p>
      <div className="mt-6 flex gap-4">
        <Button
          onClick={reset}
          size="sm"
          className="bg-[#C4A747] text-[#333333] hover:bg-[#C4A747]/90 focus-visible:ring-2 focus-visible:ring-[#C4A747] focus-visible:ring-offset-2"
          aria-label="Try again"
        >
          Try again
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={ROUTES.collections} className="focus-visible:ring-2 focus-visible:ring-[#C4A747] focus-visible:ring-offset-2">
            Browse collections
          </Link>
        </Button>
      </div>
    </div>
  );
}

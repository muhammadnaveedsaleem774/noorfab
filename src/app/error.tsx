"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { Container } from "@/components/layout/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <Container
      className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
      role="alert"
    >
      <AlertCircle className="h-16 w-16 text-[#C4A747]" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-[#333333]">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We encountered an error. Please try again or return to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button
          onClick={reset}
          className="bg-[#C4A747] text-[#333333] hover:bg-[#C4A747]/90 focus-visible:ring-2 focus-visible:ring-[#C4A747] focus-visible:ring-offset-2"
          aria-label="Try again"
        >
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.home} className="focus-visible:ring-2 focus-visible:ring-[#C4A747] focus-visible:ring-offset-2">
            Go home
          </Link>
        </Button>
      </div>
    </Container>
  );
}

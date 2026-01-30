import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container
      className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-label="Page not found"
    >
      <FileQuestion className="h-20 w-20 text-[#C4A747]" aria-hidden />
      <h1 className="mt-6 text-3xl font-bold text-[#333333]">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-8 bg-[#C4A747] text-[#333333] hover:bg-[#C4A747]/90 focus-visible:ring-2 focus-visible:ring-[#C4A747] focus-visible:ring-offset-2">
        <Link href={ROUTES.home}>Back to home</Link>
      </Button>
    </Container>
  );
}

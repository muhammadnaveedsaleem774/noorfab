import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function ShopNotFound() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-label="Page not found"
    >
      <Package className="h-16 w-16 text-[#C4A747]" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-[#333333]">Not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        This product or page doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-6 bg-[#C4A747] text-[#333333] hover:bg-[#C4A747]/90 focus-visible:ring-2 focus-visible:ring-[#C4A747] focus-visible:ring-offset-2">
        <Link href={ROUTES.collections}>Browse collections</Link>
      </Button>
    </div>
  );
}

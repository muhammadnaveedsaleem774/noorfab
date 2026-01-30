"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { Container } from "@/components/layout/Container";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname ?? ROUTES.account)}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <Container className="flex min-h-[40vh] items-center justify-center py-8">
        <p className="text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <Container className="py-8">{children}</Container>;
}

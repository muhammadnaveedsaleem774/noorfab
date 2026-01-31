"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Container } from "./Container";

const LABELS: Record<string, string> = {
  [ROUTES.home]: "Home",
  [ROUTES.shop]: "Shop",
  [ROUTES.collections]: "Collections",
  "/products": "Shop", // Products route doesn't exist, redirect to Shop
  [ROUTES.about]: "Who We Are",
  [ROUTES.contact]: "Contact",
  [ROUTES.cart]: "Cart",
  [ROUTES.wishlist]: "Wishlist",
  [ROUTES.account]: "Account",
  [ROUTES.login]: "Sign In",
  [ROUTES.checkout]: "Checkout",
};

// Paths that should redirect to different routes
const PATH_REDIRECTS: Record<string, string> = {
  "/products": ROUTES.shop, // /products doesn't exist, link to /shop
};

function getBreadcrumbSegments(pathname: string): { path: string; label: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: { path: string; label: string }[] = [{ path: "/", label: "Home" }];
  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    const label = LABELS[acc] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    items.push({ path: acc, label });
  }
  return items;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = getBreadcrumbSegments(pathname);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb">
      <Container className="py-3">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
        {segments.map(({ path, label }, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={path} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-[#333333]/50"
                  aria-hidden
                />
              )}
              {isLast ? (
                <span
                  className="font-medium text-[#C4A747]"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={PATH_REDIRECTS[path] ?? path}
                  className="text-[#333333] transition-colors hover:text-[#C4A747]"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
        </ol>
      </Container>
    </nav>
  );
}

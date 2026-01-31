"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Heart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSearchOpen } from "@/components/shared/Providers";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const GOLD = "#C4A747";

const NAV_ITEMS = [
  { href: ROUTES.home, label: "Home", icon: Home },
  { href: ROUTES.collections, label: "Collections", icon: LayoutGrid },
  { label: "Search", icon: Search, isSearch: true },
  { href: ROUTES.wishlist, label: "Wishlist", icon: Heart, showBadge: true },
  { href: ROUTES.account, label: "Account", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { setSearchOpen } = useSearchOpen();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  const showWishlistCount = mounted ? wishlistCount : 0;

  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[1000] flex h-16 items-stretch",
        "border-t border-[#eee] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]",
        "pb-[env(safe-area-inset-bottom)]"
      )}
      aria-label="Bottom navigation"
    >
      <div className="flex w-full flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            "href" in item && item.href === ROUTES.home
              ? pathname === ROUTES.home
              : "href" in item && item.href
                ? pathname.startsWith(item.href)
                : false;

          const content = (
            <>
              {/* Active indicator: 3px gold line top */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-b"
                  style={{ backgroundColor: GOLD }}
                />
              )}
              <span
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "transition-transform active:scale-95",
                  isActive ? "text-[#C4A747]" : "text-[#666666]"
                )}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <item.icon
                    className="h-6 w-6 shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {"showBadge" in item && item.showBadge && showWishlistCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C4A747] px-1 text-[10px] font-medium text-white">
                      {showWishlistCount > 99 ? "99+" : showWishlistCount}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium leading-tight">
                  {item.label}
                </span>
              </span>
            </>
          );

          if ("isSearch" in item && item.isSearch) {
            return (
              <button
                key="search"
                type="button"
                onClick={() => setSearchOpen(true)}
                className="relative flex min-h-[64px] min-w-0 flex-1 flex-col items-center justify-center py-2"
                aria-label="Search"
              >
                {content}
              </button>
            );
          }

          if ("href" in item && item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex min-h-[64px] min-w-0 flex-1 flex-col items-center justify-center py-2"
              >
                {content}
              </Link>
            );
          }

          return null;
        })}
      </div>
    </nav>
  );
}

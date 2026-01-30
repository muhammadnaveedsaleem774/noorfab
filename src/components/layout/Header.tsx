"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Container } from "./Container";
import { ROUTES } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.collections, label: "Collections" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const cartCount = useCartStore((s) => s.getCartItemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showCartCount = mounted ? cartCount : 0;
  const showWishlistCount = mounted ? wishlistCount : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-white/95 shadow-sm",
        "backdrop-blur-lg supports-[backdrop-filter]:bg-white/80",
        "h-[60px] md:h-[70px] lg:h-20"
      )}
    >
      <Container
        noPadding
        className="flex h-full items-center justify-between gap-4 px-4 md:px-8 lg:gap-8 lg:px-12"
      >
        {/* Logo: 24px mobile, 32px desktop */}
        <Link
          href={ROUTES.home}
          className={cn(
            "shrink-0 font-bold tracking-tight text-[#C4A747]",
            "text-2xl lg:text-[32px] lg:leading-none"
          )}
        >
          AL-NOOR
        </Link>

        {/* Desktop nav (1024px+): 16px, 2rem spacing */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-base font-medium text-[#333333] transition-colors hover:text-[#C4A747]"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: Search (icon opens overlay), Wishlist, Cart, User. Tablet+: show all. Mobile: search icon opens full-screen overlay */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 min-h-touch min-w-touch text-[#333333] transition-transform hover:scale-110 hover:text-[#C4A747] hover:bg-[#C4A747]/10 lg:h-12 lg:w-12"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5 lg:h-6 lg:w-6" />
          </Button>

          <Link href={ROUTES.wishlist}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 min-h-touch min-w-touch text-[#333333] transition-transform hover:scale-110 hover:text-[#C4A747] hover:bg-[#C4A747]/10 lg:h-12 lg:w-12"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 lg:h-6 lg:w-6" />
              {showWishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C4A747] px-1 text-[10px] font-medium text-white">
                  {showWishlistCount > 99 ? "99+" : showWishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Link href={ROUTES.cart}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 min-h-touch min-w-touch text-[#333333] transition-transform hover:scale-110 hover:text-[#C4A747] hover:bg-[#C4A747]/10 lg:h-12 lg:w-12"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5 lg:h-6 lg:w-6" />
              {showCartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C4A747] px-1 text-[10px] font-medium text-white">
                  {showCartCount > 99 ? "99+" : showCartCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 min-h-touch min-w-touch text-[#333333] transition-transform hover:scale-110 hover:text-[#C4A747] hover:bg-[#C4A747]/10 lg:h-12 lg:w-12"
                aria-label="User menu"
              >
                <User className="h-5 w-5 lg:h-6 lg:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {mounted && status === "authenticated" && session?.user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.account}>Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-[#333333] focus:text-[#C4A747]"
                  >
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    className="w-full cursor-pointer text-left"
                    onClick={() => signIn("google")}
                  >
                    Google Sign In
                  </button>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger: tablet (768px) to desktop (1023px); mobile also uses it */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 min-h-touch min-w-touch text-[#333333] hover:text-[#C4A747]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 lg:h-6 lg:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                "h-full w-full max-w-[min(100vw,320px)] border-l border-border bg-white p-0",
                "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
                "duration-300 ease-out"
              )}
            >
              <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-4 py-4 text-left">
                <SheetTitle className="text-xl font-bold text-[#C4A747]">
                  AL-NOOR
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="min-h-touch min-w-touch"
                >
                  <X className="h-5 w-5" />
                </Button>
              </SheetHeader>
              <nav className="flex flex-col px-2 py-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center rounded-md px-4 text-base font-medium text-[#333333] transition-colors hover:bg-[#C4A747]/10 hover:text-[#C4A747]",
                      pathname === href && "font-semibold text-[#C4A747]"
                    )}
                  >
                    {label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <Link
                  href={ROUTES.wishlist}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-12 items-center rounded-md px-4 text-base text-[#333333] hover:bg-[#C4A747]/10 hover:text-[#C4A747]"
                >
                  Wishlist {showWishlistCount > 0 && `(${showWishlistCount})`}
                </Link>
                <Link
                  href={ROUTES.cart}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-12 items-center rounded-md px-4 text-base text-[#333333] hover:bg-[#C4A747]/10 hover:text-[#C4A747]"
                >
                  Cart {showCartCount > 0 && `(${showCartCount})`}
                </Link>
                {(!mounted || status !== "authenticated") && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signIn("google");
                    }}
                    className="mt-4 flex min-h-12 w-full items-center rounded-md bg-[#C4A747] px-4 text-left font-medium text-[#333333] hover:bg-[#C4A747]/90"
                  >
                    Google Sign In
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>

      <SearchBar open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

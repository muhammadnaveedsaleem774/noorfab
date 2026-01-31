"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const GOLD = "#C4A747";
const CREAM = "#F5F3EE";

const NAV_ITEMS = [
  { href: ROUTES.account, label: "Dashboard", icon: LayoutGrid },
  { href: `${ROUTES.account}/orders`, label: "Orders", icon: ShoppingBag },
  { href: `${ROUTES.account}/addresses`, label: "Addresses", icon: MapPin },
  { href: `${ROUTES.account}/wishlist`, label: "Wishlist", icon: Heart },
  { href: `${ROUTES.account}/settings`, label: "Settings", icon: Settings },
];

function Sidebar({
  user,
  pathname,
  isCollapsed,
  onToggle,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  pathname: string;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const showFull = !isCollapsed || isHovered;

  return (
    <aside
      className={cn(
        "hidden shrink-0 transition-all duration-300 lg:block",
        isCollapsed && !isHovered ? "w-[72px]" : "w-[280px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="sticky top-[80px] h-[calc(100vh-100px)] overflow-hidden rounded-r-xl p-6"
        style={{ backgroundColor: CREAM }}
      >
        {/* User Profile */}
        <div
          className={cn(
            "border-b border-[#333333]/10 pb-6 transition-all",
            !showFull && "flex justify-center"
          )}
        >
          <div className={cn("flex items-center gap-4", !showFull && "flex-col gap-2")}>
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px]"
              style={{ borderColor: GOLD }}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Profile"}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#C4A747]/20 text-xl font-bold text-[#333333]">
                  {user.name?.charAt(0) ?? "?"}
                </div>
              )}
            </div>
            {showFull && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-[#333333]">
                  {user.name ?? "User"}
                </p>
                <p className="truncate text-sm text-[#333333]/70">{user.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium transition-all",
                  isActive
                    ? "bg-[#C4A747] text-white shadow-sm"
                    : "text-[#333333] hover:bg-white hover:shadow-sm",
                  !showFull && "justify-center px-3"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {showFull && <span>{label}</span>}
                {showFull && isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Link>
            );
          })}

          {/* Logout */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: ROUTES.home })}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium text-[#333333] transition-all hover:bg-red-50 hover:text-red-600",
              !showFull && "justify-center px-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {showFull && <span>Logout</span>}
          </button>
        </nav>
      </div>
    </aside>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="sticky top-[60px] z-40 -mx-4 border-b border-[#eee] bg-white lg:hidden">
      <div className="flex overflow-x-auto px-4 py-2 scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[#C4A747] text-white"
                  : "text-[#333333] hover:bg-[#F5F3EE]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-8">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(
        `${ROUTES.login}?callbackUrl=${encodeURIComponent(pathname ?? ROUTES.account)}`
      );
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 lg:px-12">
        <LoadingSkeleton />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
  };

  return (
    <div className="mx-auto flex max-w-[1400px] gap-8 px-4 py-6 md:px-8 lg:gap-12 lg:px-12 lg:py-8">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        pathname={pathname}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="min-w-0 flex-1">
        {/* Mobile Navigation */}
        <MobileNav pathname={pathname} />

        {/* Page Content */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="py-6 lg:py-0"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

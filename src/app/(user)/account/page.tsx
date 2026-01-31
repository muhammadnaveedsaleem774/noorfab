"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowRight,
  User,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ROUTES, ORDER_STATUS } from "@/lib/constants";

const GOLD = "#C4A747";
const CREAM = "#F5F3EE";
const SAGE = "#5BA383";

const STATUS_STYLES: Record<string, string> = {
  [ORDER_STATUS.PROCESSING]: "bg-amber-100 text-amber-700 border-amber-200",
  [ORDER_STATUS.SHIPPED]: "bg-blue-100 text-blue-700 border-blue-200",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-700 border-green-200",
  [ORDER_STATUS.PENDING]: "bg-gray-100 text-gray-700 border-gray-200",
  [ORDER_STATUS.CONFIRMED]: "bg-sky-100 text-sky-700 border-sky-200",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-700 border-red-200",
};

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changePositive,
  borderColor,
  delay,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  borderColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border-l-4 p-6 md:p-8"
      style={{
        borderLeftColor: borderColor,
        background: `linear-gradient(to right, white, ${CREAM})`,
      }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${borderColor}20` }}
      >
        <Icon className="h-6 w-6" style={{ color: borderColor }} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#333333]/70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-[#333333] md:text-4xl">
        {value}
      </p>
      {change && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            changePositive ? "text-green-600" : "text-red-500"
          )}
        >
          {changePositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change}
        </div>
      )}
    </motion.div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  delay,
}: {
  icon: typeof User;
  title: string;
  description: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link
        href={href}
        className="group flex h-full flex-col rounded-xl border border-[#eee] bg-white p-6 transition-all hover:scale-[1.02] hover:shadow-lg md:p-8"
      >
        <Icon className="h-12 w-12" style={{ color: GOLD }} />
        <h3 className="mt-4 text-lg font-semibold text-[#333333]">{title}</h3>
        <p className="mt-2 flex-1 text-sm text-[#333333]/70">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#C4A747] transition group-hover:gap-3">
          Go
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function AccountDashboardPage() {
  const { data: session } = useSession();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const userName = session?.user?.name?.split(" ")[0] ?? "there";

  const stats = useMemo(() => {
    const totalOrders = MOCK_ORDERS.length;
    const totalSpent = MOCK_ORDERS.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      totalOrders,
      totalSpent,
      wishlistItems: wishlistCount,
      savedAddresses: 2, // Mock
    };
  }, [wishlistCount]);

  const recentOrders = useMemo(() => {
    return [...MOCK_ORDERS]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 3);
  }, []);

  // Get product images for orders
  const getOrderImages = (order: (typeof MOCK_ORDERS)[0]) => {
    return order.items.slice(0, 4).map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      return product?.images[0]?.url ?? "/placeholder.svg";
    });
  };

  return (
    <div className="space-y-10 lg:space-y-12">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[#333333] md:text-[32px]">
          Welcome back, {userName}!
        </h1>
        <p className="mt-1 text-base text-[#333333]/70" suppressHydrationWarning>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={String(stats.totalOrders)}
          change="+2 this month"
          changePositive
          borderColor={GOLD}
          delay={0.1}
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={formatPrice(stats.totalSpent)}
          change="+12% from last month"
          changePositive
          borderColor={SAGE}
          delay={0.15}
        />
        <StatCard
          icon={Heart}
          label="Wishlist Items"
          value={String(stats.wishlistItems)}
          borderColor="#E91E63"
          delay={0.2}
        />
        <StatCard
          icon={MapPin}
          label="Saved Addresses"
          value={String(stats.savedAddresses)}
          borderColor="#2196F3"
          delay={0.25}
        />
      </div>

      {/* Recent Orders */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#333333] md:text-2xl">
            Recent Orders
          </h2>
          <Link
            href={`${ROUTES.account}/orders`}
            className="flex items-center gap-1 text-sm font-medium text-[#C4A747] transition hover:gap-2"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#ddd] bg-[#F5F3EE]/50 py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-[#333333]/30" />
            <p className="mt-4 text-[#333333]/70">No orders yet</p>
            <Button
              asChild
              className="mt-4"
              style={{ backgroundColor: GOLD, color: "#333333" }}
            >
              <Link href={ROUTES.shop}>Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const images = getOrderImages(order);
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <Link
                  key={order.id}
                  href={`${ROUTES.account}/orders/${order.id}`}
                  className="group flex flex-col gap-4 rounded-xl border border-[#eee] bg-white p-4 transition-all hover:border-[#C4A747] hover:shadow-md md:flex-row md:items-center md:gap-6 md:p-6"
                >
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-[#333333]">
                        {order.orderNumber}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          STATUS_STYLES[order.orderStatus] ?? "bg-gray-100"
                        )}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#333333]/70" suppressHydrationWarning>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>

                  {/* Product Thumbnails */}
                  <div className="flex items-center">
                    <div className="flex -space-x-3">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-muted"
                        >
                          <Image
                            src={img}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-[#F5F3EE] text-xs font-medium text-[#333333]">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="ml-3 text-sm text-[#333333]/70">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Total & Action */}
                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-2">
                    <span className="text-lg font-bold text-[#333333]">
                      {formatPrice(order.totalAmount)}
                    </span>
                    {order.orderStatus === ORDER_STATUS.SHIPPED && (
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Truck className="h-3 w-3" />
                        Track
                      </span>
                    )}
                  </div>

                  <ChevronRight className="hidden h-5 w-5 text-[#333333]/30 transition group-hover:text-[#C4A747] md:block" />
                </Link>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-6 text-xl font-bold text-[#333333] md:text-2xl">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <QuickActionCard
            icon={User}
            title="Update Profile"
            description="Manage your account information and preferences"
            href={`${ROUTES.account}/settings`}
            delay={0.45}
          />
          <QuickActionCard
            icon={MapPin}
            title="Manage Addresses"
            description="Add, edit, or remove your shipping addresses"
            href={`${ROUTES.account}/addresses`}
            delay={0.5}
          />
          <QuickActionCard
            icon={Heart}
            title="View Wishlist"
            description="See items you've saved for later"
            href={`${ROUTES.account}/wishlist`}
            delay={0.55}
          />
        </div>
      </motion.section>
    </div>
  );
}

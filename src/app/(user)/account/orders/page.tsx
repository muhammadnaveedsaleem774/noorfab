"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

const GOLD = "#C4A747";
const ITEMS_PER_PAGE = 5;

const STATUS_STYLES: Record<string, string> = {
  [ORDER_STATUS.PROCESSING]: "bg-amber-100 text-amber-800 border-amber-200",
  [ORDER_STATUS.SHIPPED]: "bg-blue-100 text-blue-800 border-blue-200",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800 border-green-200",
  [ORDER_STATUS.PENDING]: "bg-gray-100 text-gray-800 border-gray-200",
  [ORDER_STATUS.CONFIRMED]: "bg-sky-100 text-sky-800 border-sky-200",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  [ORDER_STATUS.REFUNDED]: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatOrderDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AccountOrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (filter === "all") return [...MOCK_ORDERS];
    return MOCK_ORDERS.filter((o) => o.orderStatus === filter);
  }, [filter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  if (MOCK_ORDERS.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-[#333333]">Orders</h1>
        <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center">
          <p className="text-muted-foreground">You have no orders yet.</p>
          <Button asChild className="mt-4" style={{ backgroundColor: GOLD, color: "#333333" }}>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#333333]">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {["all", ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => { setFilter(status); setPage(1); }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filter === status
                ? "border-[#C4A747] bg-[#C4A747]/15 text-[#C4A747]"
                : "border-[#333333]/20 text-[#333333] hover:border-[#C4A747]/50"
            }`}
          >
            {status === "all" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {paginated.map((order) => (
          <li key={order.id}>
            <div className="rounded-lg border border-[#333333]/10 bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#333333]">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#333333]">{formatPrice(order.totalAmount)}</span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.orderStatus] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4 border-[#333333]/20">
                <Link href={`/account/orders/${order.id}`}>View Details</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Orders pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-[#333333]/20"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-[#333333]/20"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, ROUTES } from "@/lib/constants";

const GOLD = "#C4A747";

const STEPS = [
  { key: ORDER_STATUS.CONFIRMED, label: "Confirmed" },
  { key: ORDER_STATUS.PROCESSING, label: "Processing" },
  { key: ORDER_STATUS.SHIPPED, label: "Shipped" },
  { key: ORDER_STATUS.DELIVERED, label: "Delivered" },
];

function formatOrderDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const order = MOCK_ORDERS.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild variant="outline" onClick={() => router.push("/account/orders")}>
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
  const productMap = new Map(MOCK_PRODUCTS.map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-[#333333]/20">
            <Link href={ROUTES.shop}>Reorder</Link>
          </Button>
          {order.orderStatus === ORDER_STATUS.DELIVERED && (
            <Button size="sm" style={{ backgroundColor: GOLD, color: "#333333" }}>
              Download Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-lg border border-[#333333]/10 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#333333]">Order status</h2>
        <ol className="flex flex-wrap gap-4 sm:flex-nowrap">
          {STEPS.map((step, i) => {
            const done = currentStepIndex >= i;
            const current = currentStepIndex === i;
            return (
              <li key={step.key} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                    done ? "bg-[#C4A747] text-[#333333]" : "bg-[#333333]/10 text-[#333333]"
                  } ${current ? "ring-2 ring-[#C4A747] ring-offset-2" : ""}`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`text-sm ${done ? "font-medium text-[#333333]" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="hidden flex-1 border-t border-[#333333]/20 sm:block" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
        {order.trackingNumber && order.orderStatus !== ORDER_STATUS.PROCESSING && order.orderStatus !== ORDER_STATUS.CONFIRMED && (
          <p className="mt-4 text-sm text-muted-foreground">
            Tracking: <strong className="text-[#333333]">{order.trackingNumber}</strong>
          </p>
        )}
      </div>

      {/* Shipping address */}
      <div className="rounded-lg border border-[#333333]/10 bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-[#333333]">Shipping address</h2>
        <address className="not-italic text-sm text-muted-foreground">
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.street}<br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
          {order.shippingAddress.country}<br />
          {order.shippingAddress.phone}
        </address>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-[#333333]/10 bg-card overflow-hidden">
        <h2 className="border-b border-[#333333]/10 px-6 py-4 text-lg font-semibold text-[#333333]">Items ordered</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#333333]/10 bg-muted/30">
                <th className="px-6 py-3 text-left font-medium text-[#333333]">Product</th>
                <th className="px-6 py-3 text-left font-medium text-[#333333]">Variant</th>
                <th className="px-6 py-3 text-right font-medium text-[#333333]">Qty</th>
                <th className="px-6 py-3 text-right font-medium text-[#333333]">Price</th>
                <th className="px-6 py-3 text-right font-medium text-[#333333]">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const product = productMap.get(item.productId);
                const variant = product?.variants.find((v) => v.variantSKU === item.variantSKU);
                const subtotal = item.unitPrice * item.quantity;
                return (
                  <tr key={item.variantSKU} className="border-b border-[#333333]/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                          <Image
                            src={product?.images[0]?.url ?? "/placeholder.svg"}
                            alt={product?.name ?? "Product"}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <span className="font-medium text-[#333333]">{product?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {variant ? `${variant.size} / ${variant.color}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-right">{formatPrice(item.unitPrice)}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatPrice(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="rounded-lg border border-[#333333]/10 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#333333]">Price breakdown</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-medium">{formatPrice(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-[#333333]/10 pt-3 text-lg font-bold text-[#333333]">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalAmount)}</dd>
          </div>
        </dl>
      </div>

      <Button asChild variant="outline" className="border-[#333333]/20">
        <Link href="/account/orders">Back to Orders</Link>
      </Button>
    </div>
  );
}

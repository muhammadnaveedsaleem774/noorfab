import { NextResponse } from "next/server";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import type { CreateOrderData } from "@/lib/api/orders";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/constants";

/** GET /api/orders - list current user's orders (stub: returns mock orders) */
export async function GET() {
  return NextResponse.json(MOCK_ORDERS);
}

/** POST /api/orders - create order (stub: returns new order) */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateOrderData;
  const { items = [], shippingAddress, paymentMethod = "CASH_ON_DELIVERY" } = body;
  const subtotal = items.reduce((sum, i) => sum + 3000 * i.quantity, 0);
  const shippingFee = 500;
  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: `ALN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    userId: "user-1",
    items: items.map((i) => ({ ...i, unitPrice: 3000 })),
    shippingAddress,
    paymentMethod,
    paymentStatus: PAYMENT_STATUS.PENDING,
    orderStatus: ORDER_STATUS.PENDING,
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
    createdAt: new Date().toISOString(),
    trackingNumber: undefined as string | undefined,
  };
  return NextResponse.json(newOrder);
}

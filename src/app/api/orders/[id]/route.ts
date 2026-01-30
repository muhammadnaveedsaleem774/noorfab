import { NextResponse } from "next/server";
import { MOCK_ORDERS } from "@/lib/mockOrders";

/** GET /api/orders/[id] - get single order (stub) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

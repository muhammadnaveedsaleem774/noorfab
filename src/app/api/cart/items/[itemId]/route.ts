import { NextResponse } from "next/server";
import type { CartResponse } from "@/lib/api/cart";

/** PATCH /api/cart/items/[itemId] - update quantity (stub) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const body = await request.json().catch(() => ({}));
  const { quantity } = body as { quantity?: number };
  const cart: CartResponse = {
    id: "cart-1",
    items: [],
  };
  return NextResponse.json(cart);
}

/** DELETE /api/cart/items/[itemId] - remove item (stub) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const cart: CartResponse = {
    id: "cart-1",
    items: [],
  };
  return NextResponse.json(cart);
}

import { NextResponse } from "next/server";
import type { CartResponse } from "@/lib/api/cart";

/** GET /api/cart - fetch current cart (stub: returns empty cart) */
export async function GET() {
  const cart: CartResponse = {
    id: "cart-1",
    items: [],
  };
  return NextResponse.json(cart);
}

/** POST /api/cart - add item to cart (stub: returns cart with item) */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { productId, variantSKU, quantity } = body as {
    productId?: string;
    variantSKU?: string;
    quantity?: number;
  };
  const cart: CartResponse = {
    id: "cart-1",
    items:
      productId && variantSKU && quantity
        ? [
            {
              id: `item-${Date.now()}`,
              productId,
              variantSKU,
              quantity: Math.max(1, quantity),
            },
          ]
        : [],
  };
  return NextResponse.json(cart);
}

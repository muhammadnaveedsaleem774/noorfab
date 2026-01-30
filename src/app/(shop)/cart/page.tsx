"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, type CartStoreItem } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const GOLD = "#C4A747";

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  isUpdating,
}: {
  item: CartStoreItem;
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating: string | null;
}) {
  const variant = item.product.variants.find((v) => v.variantSKU === item.variantSKU);
  const size = variant?.size ?? "";
  const color = variant?.color ?? "";
  const unitPrice = item.product.salePrice ?? item.product.price;
  const lineTotal = unitPrice * item.quantity;
  const maxQty = variant?.stock ?? 99;
  const busy = isUpdating === item.id;

  return (
    <li className="flex gap-4 rounded-lg border border-[#333333]/10 bg-card p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={item.product.images[0]?.url ?? "/placeholder.svg"}
          alt={item.product.images[0]?.altText ?? item.product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.product.slug}`}
          className="font-medium text-[#333333] hover:text-[#C4A747]"
        >
          {item.product.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {size} / {color}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded border border-input">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
              disabled={busy || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[2rem] text-center text-sm tabular-nums" aria-live="polite">
              {busy ? "…" : item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onUpdateQty(item.id, Math.min(maxQty, item.quantity + 1))}
              disabled={busy || item.quantity >= maxQty}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(item.id)}
            disabled={busy}
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-medium text-[#333333]">{formatPrice(lineTotal)}</p>
        <p className="text-xs text-muted-foreground">
          {formatPrice(unitPrice)} each
        </p>
      </div>
    </li>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCartStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateQty = (itemId: string, qty: number) => {
    setUpdatingId(itemId);
    updateQuantity(itemId, qty);
    setTimeout(() => setUpdatingId(null), 300);
  };

  const subtotal = getCartTotal();
  const shippingLabel = "Calculated at checkout";

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <h1 className="text-2xl font-bold text-[#333333]">Your cart is empty</h1>
        <p className="text-muted-foreground">Add items from the shop to continue.</p>
        <Button asChild size="lg" style={{ backgroundColor: GOLD, color: "#333333" }}>
          <Link href={ROUTES.shop}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#333333]">Shopping Cart</h1>
          <Link
            href={ROUTES.shop}
            className="text-sm font-medium text-[#C4A747] hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
        <ul className="mt-6 space-y-4" role="list">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={handleUpdateQty}
              onRemove={removeFromCart}
              isUpdating={updatingId}
            />
          ))}
        </ul>
      </div>

      <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[360px]">
        <div className="rounded-lg border border-[#333333]/10 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#333333]">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-[#333333]">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">{shippingLabel}</dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-[#333333]/10 pt-4">
            <div className="flex justify-between text-lg font-bold text-[#333333]">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
          <Button
            asChild
            className="mt-6 w-full"
            size="lg"
            style={{ backgroundColor: GOLD, color: "#333333" }}
          >
            <Link href={ROUTES.checkout}>Proceed to Checkout</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export function CartSummary() {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href={ROUTES.shop}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <ul className="flex-1 space-y-4">
        {items.map((item) => {
          const variant = item.product.variants.find((v) => v.variantSKU === item.variantSKU);
          const size = variant?.size ?? "";
          const color = variant?.color ?? "";
          const linePrice = (item.product.salePrice ?? item.product.price) * item.quantity;
          return (
            <li
              key={item.id}
              className="flex gap-4 rounded-lg border bg-card p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.product.images[0]?.url ?? "/placeholder.svg"}
                  alt={item.product.images[0]?.altText ?? item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-primary-dark">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {size} / {color}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <p className="shrink-0 font-medium">
                {formatPrice(linePrice)}
              </p>
            </li>
          );
        })}
      </ul>
      <div className="w-full shrink-0 rounded-lg border bg-card p-6 lg:w-80">
        <h2 className="text-lg font-semibold text-primary-dark">Summary</h2>
        <p className="mt-2 text-2xl font-bold text-primary-dark">
          {formatPrice(getCartTotal())}
        </p>
        <Button asChild className="mt-4 w-full" size="lg">
          <Link href={ROUTES.checkout}>Proceed to Checkout</Link>
        </Button>
      </div>
    </div>
  );
}

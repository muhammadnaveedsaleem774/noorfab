"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "react-query";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/types";

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams(ids.map((id) => ["id", id]));
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function WishlistSummary() {
  const productIds = useWishlistStore((s) => s.productIds);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  const { data: products = [], isLoading } = useQuery(
    ["wishlist-products", productIds],
    () => fetchProductsByIds(productIds),
    { enabled: productIds.length > 0 }
  );

  if (productIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">Your wishlist is empty.</p>
        <Button asChild>
          <Link href={ROUTES.shop}>Discover Products</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const firstVariant = product.variants[0];
        const variantSKU = firstVariant?.variantSKU;
        const inStock = product.variants.some((v) => v.stock > 0);
        return (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-square bg-muted">
                <Image
                  src={product.images[0]?.url ?? "/placeholder.svg"}
                  alt={product.images[0]?.altText ?? product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </Link>
            <CardContent className="flex flex-col gap-2 p-4">
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-semibold text-primary-dark hover:text-sage">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatPrice(product.price)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => variantSKU && addToCart(product, variantSKU, 1)}
                  disabled={!inStock || !variantSKU}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

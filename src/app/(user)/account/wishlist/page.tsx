"use client";

import { useQuery } from "react-query";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/types";

const GOLD = "#C4A747";

async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const params = new URLSearchParams(ids.map((id) => ["id", id]));
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function AccountWishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const addToCart = useCartStore((s) => s.addToCart);

  const { data: products = [], isLoading } = useQuery(
    ["account-wishlist-products", productIds],
    () => fetchProductsByIds(productIds),
    { enabled: productIds.length > 0 }
  );

  if (productIds.length === 0 && !isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-[#333333]">Wishlist</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild className="mt-4" style={{ backgroundColor: GOLD, color: "#333333" }}>
            <Link href={ROUTES.shop}>Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-[#333333]">Wishlist</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square animate-pulse bg-muted" />
              <CardContent className="p-4">
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#333333]">Wishlist</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const firstVariant = product.variants[0];
          const variantSKU = firstVariant?.variantSKU;
          const inStock = product.variants.some((v) => v.stock > 0);

          return (
            <Card key={product.id} className="overflow-hidden transition hover:shadow-md">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={product.images[0]?.url ?? "/placeholder.svg"}
                    alt={product.images[0]?.altText ?? product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="line-clamp-2 font-semibold text-[#333333] hover:text-[#C4A747]">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 font-medium text-[#333333]">
                  {formatPrice(product.salePrice ?? product.price)}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 p-4 pt-0">
                <Button
                  size="sm"
                  className="flex-1"
                  style={{ backgroundColor: GOLD, color: "#333333" }}
                  onClick={() => variantSKU && addToCart(product, variantSKU, 1)}
                  disabled={!inStock || !variantSKU}
                >
                  <ShoppingBag className="mr-1.5 h-4 w-4" />
                  Move to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-[#333333]/20"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <Heart className="h-4 w-4 fill-[#C4A747] text-[#C4A747]" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

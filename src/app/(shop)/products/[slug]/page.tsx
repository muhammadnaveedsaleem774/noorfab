"use client";

import { useQuery } from "react-query";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";
import { COLOR_SWATCH_HEX } from "@/lib/constants";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/types";

const GOLD = "#C4A747";

async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const value = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" role="img" aria-label={`Rating: ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-current"
            style={{ color: i <= value ? GOLD : "#d1d5db" }}
          />
        ))}
      </div>
      {count != null && count > 0 && (
        <span className="text-sm text-muted-foreground">({count} reviews)</span>
      )}
    </div>
  );
}

export default function ProductSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const inWishlist = useWishlistStore((s) => s.isInWishlist);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }, [product, allProducts]);

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedSize(product.variants[0].size);
      setSelectedColor(product.variants[0].color);
    }
  }, [product?.id]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find(
      (v) => v.size === (selectedSize ?? product.variants[0].size) && v.color === (selectedColor ?? product.variants[0].color)
    ) ?? product.variants[0];
  }, [product, selectedSize, selectedColor]);

  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const availableSizes = useMemo(() => {
    if (!product) return [];
    const bySize = new Map<string, number>();
    product.variants.forEach((v) => {
      const cur = bySize.get(v.size) ?? 0;
      bySize.set(v.size, cur + v.stock);
    });
    return Array.from(bySize.entries()).map(([size, stock]) => ({ size, stock }));
  }, [product]);
  const availableColors = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    return product.variants.filter((v) => {
      if (seen.has(v.color)) return false;
      seen.add(v.color);
      return true;
    });
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart(product, selectedVariant.variantSKU, quantity);
  };

  if (!slug) return null;

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-[1fr_1fr] lg:grid-cols-[60%_40%]">
        <div className="aspect-square animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-10 w-1/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link href={ROUTES.shop} className="mt-2 inline-block text-[#C4A747] hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: "/placeholder.svg", altText: product.name, order: 0 }];
  const mainImage = images[mainImageIndex] ?? images[0];
  const reviewCount = 0; // mock

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            sku: product.SKU,
            image: images.map((i) => (i.url.startsWith("http") ? i.url : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${i.url}`)),
            offers: {
              "@type": "Offer",
              price: product.salePrice ?? product.price,
              priceCurrency: "USD",
              availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
            aggregateRating: product.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: reviewCount || 1,
                }
              : undefined,
          }),
        }}
      />

      <div className="grid gap-8 md:grid-cols-[1fr_1fr] lg:grid-cols-[60%_40%]">
        {/* Left: Image gallery */}
        <div className="space-y-3">
          <div
            className="relative aspect-square overflow-hidden rounded-lg bg-muted"
            onClick={() => setZoomOpen(true)}
          >
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? product.name}
              fill
              className="cursor-zoom-in object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMainImageIndex(i)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  i === mainImageIndex ? "border-[#C4A747]" : "border-transparent hover:border-[#333333]/30"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${product.name} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-[#333333] md:text-3xl">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} count={reviewCount} />
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            {product.salePrice != null && product.salePrice < product.price ? (
              <>
                <span className="text-2xl font-bold text-[#C4A747]">{formatPrice(product.salePrice)}</span>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-[#333333]">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">SKU: {product.SKU}</p>
          <p className="mt-1 text-sm text-[#333333]">
            Material: {product.material}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`}
              aria-hidden
            />
            <span className="text-sm font-medium">
              {inStock ? "In stock" : "Out of stock"}
            </span>
          </div>

          {/* Size */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-[#333333]">Size</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(({ size, stock: sizeStock }) => {
                const disabled = sizeStock === 0;
                const active = (selectedSize ?? product.variants[0]?.size) === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      active ? "border-[#C4A747] bg-[#C4A747]/10 text-[#333333]" : "border-input hover:border-[#C4A747]/50"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          {availableColors.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-[#333333]">Color</p>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((v) => {
                  const hex = COLOR_SWATCH_HEX[v.color];
                  const active = (selectedColor ?? product.variants[0]?.color) === v.color;
                  return (
                    <button
                      key={v.color}
                      type="button"
                      onClick={() => setSelectedColor(v.color)}
                      className={`h-9 w-9 rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2 ${
                        active ? "border-[#C4A747] ring-2 ring-[#C4A747]/30" : "border-gray-300 hover:border-[#C4A747]/50"
                      }`}
                      style={{ backgroundColor: hex ?? "#ccc" }}
                      title={v.color}
                      aria-label={`Color ${v.color}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-[#333333]">Quantity</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={Math.min(99, selectedVariant?.stock ?? 1)}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(selectedVariant?.stock ?? 99, Number(e.target.value) || 1)))}
                className="h-10 w-16 text-center"
                aria-label="Quantity"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 99, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1 font-semibold"
              style={{ backgroundColor: GOLD, color: "#333333" }}
              onClick={handleAddToCart}
              disabled={!inStock || !selectedVariant}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              className="border-[#C4A747] text-[#333333] hover:bg-[#C4A747]/10 hover:text-[#333333]"
              onClick={() => (inWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${inWishlist(product.id) ? "fill-[#C4A747] text-[#C4A747]" : ""}`}
              />
              {inWishlist(product.id) ? "In Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          {/* Accordion */}
          <Accordion type="multiple" className="mt-8 w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>{product.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>Material & Care</AccordionTrigger>
              <AccordionContent>
                <p><strong>Material:</strong> {product.material}</p>
                <p className="mt-2">Machine wash cold, tumble dry low. Do not bleach.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping Info</AccordionTrigger>
              <AccordionContent>
                <div className="flex items-start gap-2">
                  <Truck className="h-5 w-5 shrink-0 text-[#C4A747]" />
                  <div>
                    <p>Free shipping on orders over $50.</p>
                    <p className="mt-1">Delivery within 5–7 business days.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12 border-t border-[#333333]/10 pt-8" aria-label="Reviews">
        <h2 className="text-xl font-bold text-[#333333]">Reviews</h2>
        <p className="mt-2 text-muted-foreground">
          {reviewCount === 0 ? "No reviews yet. Be the first to review!" : `${reviewCount} review(s).`}
        </p>
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-[#333333]/10 pt-8" aria-label="Related products">
          <h2 className="text-xl font-bold text-[#333333]">Related Products</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom modal (simple) */}
      {zoomOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomOpen(false)}
          aria-label="Close zoom"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={mainImage.url}
              alt={mainImage.altText ?? product.name}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </button>
      )}
    </>
  );
}

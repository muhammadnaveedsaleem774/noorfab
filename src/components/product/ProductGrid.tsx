"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { PackageOpen } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

const SKELETON_COUNT = 8;
const STAGGER_MS = 50;

interface ProductGridProps {
  /** If provided, these products are shown (no fetch). Use for filtered/sorted lists. */
  products?: Product[];
  /** Optional search term to highlight in product names */
  highlightTerm?: string;
  /** When true, empty state shows "Clear Filters" button; pass with onClearFilters */
  hasActiveFilters?: boolean;
  /** Callback for empty state "Clear Filters" button */
  onClearFilters?: () => void;
}

export function ProductGrid({
  products: productsProp,
  highlightTerm,
  hasActiveFilters = false,
  onClearFilters,
}: ProductGridProps) {
  const { data: fetchedProducts = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: productsProp === undefined,
  });
  const products = productsProp ?? fetchedProducts;
  const gridRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsInView(true);
        });
      },
      { rootMargin: "80px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (isLoading && productsProp === undefined) {
    return (
      <div
        className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:gap-x-6 lg:gap-y-10 xl:grid-cols-4 xl:gap-x-8 xl:gap-y-12 max-[400px]:grid-cols-1 max-[400px]:gap-4"
        role="status"
        aria-label="Loading products"
      >
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive" role="alert">
        Unable to load products. Try again later.
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted bg-muted/20 py-16 text-center"
        role="status"
      >
        <PackageOpen
          className="mb-4 h-16 w-16 text-muted-foreground"
          style={{ opacity: 0.3 }}
          aria-hidden
        />
        <p className="text-lg font-semibold text-[#333333]">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters
        </p>
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            className="mt-6"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:gap-x-6 lg:gap-y-10 xl:grid-cols-4 xl:gap-x-8 xl:gap-y-12 max-[400px]:grid-cols-1 max-[400px]:gap-4"
      role="list"
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          role="listitem"
          className={isInView ? "animate-fade-in-up" : "opacity-0"}
          style={
            isInView
              ? {
                  animationDelay: `${index * STAGGER_MS}ms`,
                  animationFillMode: "backwards",
                }
              : undefined
          }
        >
          <ProductCard
            product={product}
            highlightTerm={highlightTerm}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}

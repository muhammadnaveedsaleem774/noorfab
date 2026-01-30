"use client";

import { useQuery } from "react-query";
import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters, DEFAULT_FILTERS, type ProductFiltersState } from "@/components/product/ProductFilters";
import { ProductSort, type SortValue } from "@/components/product/ProductSort";
import { filterProducts, sortProducts } from "@/lib/productFilters";
import type { Product } from "@/types";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function ShopPage() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const [filters, setFilters] = useState<ProductFiltersState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortValue>("newest");

  const filteredAndSorted = useMemo(
    () => sortProducts(filterProducts(products, filters), sort),
    [products, filters, sort]
  );
  const hasActiveFilters =
    filters.priceMin > 0 ||
    filters.priceMax < 100000 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.material !== "" ||
    filters.minRating > 0 ||
    filters.inStockOnly;
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-[#333333]">Shop</h1>
        <ProductSort value={sort} onValueChange={setSort} aria-label="Sort products" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <ProductFilters value={filters} onChange={setFilters} />
        <div className="min-w-0 flex-1">
          <ProductGrid
            products={filteredAndSorted}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
}

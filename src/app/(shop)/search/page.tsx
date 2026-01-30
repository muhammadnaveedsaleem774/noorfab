"use client";

import { useQuery } from "react-query";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/product/ProductCard";
import { ProductFilters, DEFAULT_FILTERS, type ProductFiltersState } from "@/components/product/ProductFilters";
import { ProductSort, type SortValue } from "@/components/product/ProductSort";
import { filterProducts, sortProducts } from "@/lib/productFilters";
import { ROUTES } from "@/lib/constants";
import { MOCK_COLLECTIONS } from "@/lib/mockData";
import type { Product } from "@/types";

const ITEMS_PER_PAGE = 12;

async function fetchSearchResults(q: string): Promise<Product[]> {
  if (!q.trim()) return [];
  const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
  if (!res.ok) return [];
  return res.json();
}

function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: ProductFiltersState;
  onRemove: (patch: Partial<ProductFiltersState>) => void;
  onClearAll: () => void;
}) {
  const chips: { key: string; label: string }[] = [];
  if (filters.priceMin > 0 || filters.priceMax < 100000) {
    chips.push({
      key: "price",
      label: `Price: ${filters.priceMin || "0"} – ${filters.priceMax === 100000 ? "Any" : filters.priceMax}`,
    });
  }
  filters.sizes.forEach((s) => chips.push({ key: `size-${s}`, label: `Size: ${s}` }));
  filters.colors.forEach((c) => chips.push({ key: `color-${c}`, label: `Color: ${c}` }));
  if (filters.material) chips.push({ key: "material", label: `Material: ${filters.material}` });
  if (filters.minRating > 0) chips.push({ key: "rating", label: `${filters.minRating}+ stars` });
  if (filters.inStockOnly) chips.push({ key: "stock", label: "In stock only" });

  if (chips.length === 0) return null;

  const removePrice = () => onRemove({ priceMin: 0, priceMax: 100000 });
  const removeSize = (s: string) => onRemove({ sizes: filters.sizes.filter((x) => x !== s) });
  const removeColor = (c: string) => onRemove({ colors: filters.colors.filter((x) => x !== c) });
  const removeMaterial = () => onRemove({ material: "" });
  const removeRating = () => onRemove({ minRating: 0 });
  const removeStock = () => onRemove({ inStockOnly: false });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active:</span>
      {chips.map(({ key, label }) => {
        const remove = () => {
          if (key === "price") removePrice();
          else if (key.startsWith("size-")) removeSize(key.replace("size-", ""));
          else if (key.startsWith("color-")) removeColor(key.replace("color-", ""));
          else if (key === "material") removeMaterial();
          else if (key === "rating") removeRating();
          else if (key === "stock") removeStock();
        };
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-full border border-[#C4A747]/50 bg-[#C4A747]/10 px-3 py-1 text-sm text-[#333333]"
          >
            {label}
            <button
              type="button"
              onClick={remove}
              className="rounded-full p-0.5 hover:bg-[#C4A747]/20 focus:outline-none focus:ring-2 focus:ring-[#C4A747]"
              aria-label={`Remove ${label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        );
      })}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm font-medium text-[#C4A747] underline hover:no-underline"
      >
        Clear all
      </button>
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [filters, setFilters] = useState<ProductFiltersState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => fetchSearchResults(q),
    enabled: q.trim().length > 0,
  });

  const filteredAndSorted = useMemo(
    () => sortProducts(filterProducts(results, filters), sort),
    [results, filters, sort]
  );
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(
    () => filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredAndSorted, page]
  );

  useEffect(() => {
    setPage(1);
  }, [q, filters, sort]);

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const hasQuery = q.trim().length > 0;
  const noResults = hasQuery && !isLoading && filteredAndSorted.length === 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="w-full shrink-0 lg:w-[20%]">
        <ProductFilters value={filters} onChange={setFilters} />
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">
              {hasQuery ? (
                <>Search results for &ldquo;{q}&rdquo;</>
              ) : (
                "Search"
              )}
            </h1>
            {hasQuery && (
              <p className="mt-1 text-muted-foreground">
                {isLoading
                  ? "Searching..."
                  : `${filteredAndSorted.length} product${filteredAndSorted.length !== 1 ? "s" : ""} found`}
              </p>
            )}
          </div>
        </div>

        {hasQuery && (
          <div className="flex flex-col gap-3 border-b border-[#333333]/10 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {!isLoading && (
                <ProductSort
                  value={sort}
                  onValueChange={(v) => {
                    setSort(v);
                    setPage(1);
                  }}
                  aria-label="Sort search results"
                />
              )}
            </div>
            <ActiveFilterChips
              filters={filters}
              onRemove={(p) => {
                setFilters((f) => ({ ...f, ...p }));
                setPage(1);
              }}
              onClearAll={clearAllFilters}
            />
          </div>
        )}

        {!hasQuery && (
          <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center">
            <p className="text-muted-foreground">Enter a search term above to find products.</p>
            <Link href={ROUTES.collections} className="mt-2 inline-block text-[#C4A747] hover:underline">
              Browse collections
            </Link>
          </div>
        )}

        {hasQuery && isLoading && (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            role="status"
            aria-label="Loading search results"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {hasQuery && !isLoading && noResults && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
            <p className="text-muted-foreground">No results found for &ldquo;{q}&rdquo;.</p>
            <p className="mt-2 text-sm text-muted-foreground">Suggestions:</p>
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              <li>Check spelling or try different keywords</li>
              <li>Try more general terms (e.g. cotton, linen, shirt)</li>
              <li>Clear filters above or browse by collection</li>
            </ul>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded border border-[#333333]/20 px-4 py-2 text-sm font-medium text-[#333333] hover:border-[#C4A747] hover:text-[#C4A747]"
              >
                Clear filters
              </button>
              <Link
                href={ROUTES.collections}
                className="rounded bg-[#C4A747] px-4 py-2 text-sm font-medium text-[#333333] hover:bg-[#C4A747]/90"
              >
                Browse collections
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-[#333333]">Popular collections</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {MOCK_COLLECTIONS.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  className="rounded-full border border-[#C4A747]/50 bg-[#C4A747]/10 px-4 py-2 text-sm text-[#333333] hover:bg-[#C4A747]/20"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasQuery && !isLoading && !noResults && (
          <>
            <ProductGrid products={paginated} highlightTerm={q.trim() || undefined} />
            {totalPages > 1 && (
              <nav aria-label="Search pagination" className="flex justify-center gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border border-[#333333]/20 px-4 py-2 text-sm font-medium text-[#333333] disabled:opacity-50 hover:border-[#C4A747] hover:text-[#C4A747]"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded border border-[#333333]/20 px-4 py-2 text-sm font-medium text-[#333333] disabled:opacity-50 hover:border-[#C4A747] hover:text-[#C4A747]"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

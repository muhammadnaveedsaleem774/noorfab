"use client";

import { useQuery } from "react-query";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters, DEFAULT_FILTERS, type ProductFiltersState } from "@/components/product/ProductFilters";
import { ProductSort, type SortValue } from "@/components/product/ProductSort";
import { filterProducts, sortProducts } from "@/lib/productFilters";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/types";
import type { CollectionWithProducts } from "@/app/api/collections/[slug]/route";

const ITEMS_PER_PAGE = 12;

async function fetchCollection(slug: string): Promise<CollectionWithProducts> {
  const res = await fetch(`/api/collections/${slug}`);
  if (!res.ok) throw new Error("Collection not found");
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

export default function CollectionSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [filters, setFilters] = useState<ProductFiltersState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => fetchCollection(slug),
    enabled: !!slug,
  });

  const filteredAndSorted = useMemo(() => {
    if (!data?.products) return [];
    return sortProducts(filterProducts(data.products, filters), sort);
  }, [data?.products, filters, sort]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(
    () => filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [filteredAndSorted, page]
  );

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  if (!slug) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 h-64 animate-pulse rounded-lg bg-muted" />
        </aside>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center">
        <p className="text-muted-foreground">Collection not found.</p>
        <Link href={ROUTES.collections} className="mt-2 inline-block text-[#C4A747] hover:underline">
          View all collections
        </Link>
      </div>
    );
  }

  const { collection, products } = data;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Sidebar 20% - sticky on desktop */}
      <div className="w-full shrink-0 lg:w-[20%]">
        <ProductFilters value={filters} onChange={setFilters} />
      </div>

      {/* Main 80% */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Collection header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 text-muted-foreground">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Sort + count + active chips */}
        <div className="flex flex-col gap-3 border-b border-[#333333]/10 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? "s" : ""}
            </p>
            <ProductSort value={sort} onValueChange={(v) => { setSort(v); setPage(1); }} aria-label="Sort collection" />
          </div>
          <ActiveFilterChips filters={filters} onRemove={(p) => { setFilters((f) => ({ ...f, ...p })); setPage(1); }} onClearAll={clearAllFilters} />
        </div>

        {/* Grid or empty */}
        {filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
            <p className="text-muted-foreground">No products found.</p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-2 text-[#C4A747] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <ProductGrid products={paginated} />
            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Collection pagination" className="flex justify-center gap-2 pt-6">
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

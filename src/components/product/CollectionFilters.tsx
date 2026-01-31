"use client";

import { useState } from "react";
import { Filter, X, LayoutGrid, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SIZE_OPTIONS,
  COLOR_OPTIONS,
  MATERIAL_TYPES,
  COLOR_SWATCH_HEX,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import type { ProductFiltersState } from "./ProductFilters";
import type { SortValue } from "./ProductSort";
import { SORT_OPTIONS } from "./ProductSort";

const GOLD = "#C4A747";
const DEFAULT_MAX = 100000;

export interface CollectionFiltersProps {
  value: ProductFiltersState;
  onChange: (v: ProductFiltersState) => void;
  sort?: SortValue;
  onSortChange?: (v: SortValue) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (v: "grid" | "list") => void;
  products?: Product[];
  showCategoryFilter?: boolean;
  categories?: { id: string; name: string }[];
  categoryFilter?: string;
  onCategoryFilterChange?: (v: string) => void;
  showRelevanceSort?: boolean;
  className?: string;
}

function countActive(f: ProductFiltersState): number {
  let n = 0;
  if (f.priceMin > 0 || f.priceMax < DEFAULT_MAX) n++;
  if (f.sizes.length) n++;
  if (f.colors.length) n++;
  if (f.material) n++;
  if (f.minRating > 0) n++;
  if (f.inStockOnly) n++;
  return n;
}

function getSizeCounts(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    p.variants.forEach((v) => {
      counts[v.size] = (counts[v.size] ?? 0) + 1;
    });
  });
  return counts;
}

export function CollectionFilters({
  value,
  onChange,
  sort,
  onSortChange,
  viewMode = "grid",
  onViewModeChange,
  products = [],
  showCategoryFilter,
  categories = [],
  categoryFilter = "",
  onCategoryFilterChange,
  showRelevanceSort,
  className,
}: CollectionFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = countActive(value);
  const sizeCounts = getSizeCounts(products);

  const update = (patch: Partial<ProductFiltersState>) => {
    onChange({ ...value, ...patch });
  };

  const toggleSize = (size: string) => {
    const next = value.sizes.includes(size)
      ? value.sizes.filter((s) => s !== size)
      : [...value.sizes, size];
    update({ sizes: next });
  };

  const toggleColor = (color: string) => {
    const next = value.colors.includes(color)
      ? value.colors.filter((c) => c !== color)
      : [...value.colors, color];
    update({ colors: next });
  };

  const resetAll = () => {
    onChange({
      priceMin: 0,
      priceMax: DEFAULT_MAX,
      sizes: [],
      colors: [],
      material: "",
      minRating: 0,
      inStockOnly: false,
    });
    setMobileOpen(false);
  };

  const FiltersContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="space-y-4">
      {/* Price Range */}
      <Accordion type="single" collapsible defaultValue="price" className="border-0">
        <AccordionItem value="price" className="border-0">
          <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:no-underline [&[data-state=open]>svg]:rotate-180">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-0">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={0}
                value={value.priceMin || ""}
                onChange={(e) => update({ priceMin: Number(e.target.value) || 0 })}
                className="h-9 text-[#333333]"
              />
              <span className="text-[#999]">–</span>
              <Input
                type="number"
                placeholder="Max"
                min={0}
                value={value.priceMax === DEFAULT_MAX ? "" : value.priceMax}
                onChange={(e) =>
                  update({ priceMax: Number(e.target.value) ? Number(e.target.value) : DEFAULT_MAX })
                }
                className="h-9 text-[#333333]"
              />
            </div>
            <p className="text-xs text-[#333333]/70">
              {formatPrice(value.priceMin || 0)} – {value.priceMax === DEFAULT_MAX ? "Any" : formatPrice(value.priceMax)}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Size */}
      <Accordion type="single" collapsible defaultValue="size" className="border-0">
        <AccordionItem value="size" className="border-0">
          <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:no-underline">
            Size
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-0">
            {SIZE_OPTIONS.slice(0, 8).map((size) => (
              <label
                key={size}
                className="flex cursor-pointer items-center gap-3 py-1.5"
              >
                <input
                  type="checkbox"
                  checked={value.sizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="h-4 w-4 rounded border-[#ddd] accent-[#C4A747]"
                />
                <span className="text-sm text-[#333333]">{size}</span>
                {products.length > 0 && sizeCounts[size] !== undefined && (
                  <span className="text-xs text-[#999]">({sizeCounts[size]})</span>
                )}
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Color */}
      <Accordion type="single" collapsible defaultValue="color" className="border-0">
        <AccordionItem value="color" className="border-0">
          <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:no-underline">
            Color
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <div className="grid grid-cols-4 gap-3">
              {COLOR_OPTIONS.map((color) => {
                const hex = COLOR_SWATCH_HEX[color];
                const selected = value.colors.includes(color);
                const isMulti = color === "Multi";
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    title={color}
                    className={cn(
                      "relative h-9 w-9 shrink-0 rounded-full border-2 transition-all",
                      selected
                        ? "scale-110 border-[#C4A747] ring-2 ring-[#C4A747]/30"
                        : "border-transparent hover:scale-105"
                    )}
                    style={
                      isMulti
                        ? { background: "linear-gradient(90deg,#ec4899,#3b82f6,#22c55e)" }
                        : { backgroundColor: hex }
                    }
                    aria-pressed={selected}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Material */}
      <Accordion type="single" collapsible defaultValue="material" className="border-0">
        <AccordionItem value="material" className="border-0">
          <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:no-underline">
            Material
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-0">
            {MATERIAL_TYPES.slice(0, 8).map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-3 py-1.5"
              >
                <input
                  type="checkbox"
                  checked={value.material === m}
                  onChange={() => update({ material: value.material === m ? "" : m })}
                  className="h-4 w-4 rounded border-[#ddd] accent-[#C4A747]"
                />
                <span className="text-sm text-[#333333]">{m}</span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Rating */}
      <Accordion type="single" collapsible defaultValue="rating" className="border-0">
        <AccordionItem value="rating" className="border-0">
          <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:no-underline">
            Rating
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-0">
            {[4, 3].map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-3 py-1.5"
              >
                <input
                  type="radio"
                  name="rating-filter"
                  checked={value.minRating === r}
                  onChange={() => update({ minRating: value.minRating === r ? 0 : r })}
                  className="h-4 w-4 border-[#ddd] accent-[#C4A747]"
                />
                <span className="flex text-amber-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>{i < r ? "★" : "☆"}</span>
                  ))}
                </span>
                <span className="text-sm text-[#333333]">{r} stars & up</span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 py-1.5">
              <input
                type="radio"
                name="rating-filter"
                checked={value.minRating === 0}
                onChange={() => update({ minRating: 0 })}
                className="h-4 w-4 border-[#ddd] accent-[#C4A747]"
              />
              <span className="text-sm text-[#333333]">Any</span>
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Availability */}
      <div className="flex items-center justify-between border-t border-[#eee] pt-4">
        <span className="text-sm font-medium text-[#333333]">In Stock Only</span>
        <button
          type="button"
          role="switch"
          aria-checked={value.inStockOnly}
          onClick={() => update({ inStockOnly: !value.inStockOnly })}
          className={cn(
            "relative h-6 w-11 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2",
            value.inStockOnly ? "bg-[#C4A747]" : "bg-[#ddd]"
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
              value.inStockOnly ? "left-6" : "left-1"
            )}
          />
        </button>
      </div>

      {/* Category (search page) */}
      {showCategoryFilter && categories.length > 0 && (
        <Accordion type="single" collapsible defaultValue="category" className="border-0">
          <AccordionItem value="category" className="border-0">
            <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#333333] hover:no-underline">
              Category
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <Select
                value={categoryFilter || "all"}
                onValueChange={(v) => onCategoryFilterChange?.(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9 text-[#333333]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Buttons */}
      {!compact && (
        <div className="space-y-3 border-t border-[#eee] pt-4">
          <Button
            className="w-full text-white"
            style={{ backgroundColor: GOLD }}
            onClick={() => setMobileOpen(false)}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#ddd] text-[#333333] hover:border-[#C4A747] hover:text-[#C4A747]"
            onClick={resetAll}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );

  const sortOptions = [
    ...(showRelevanceSort ? [{ value: "relevance" as const, label: "Relevance" }] : []),
    ...SORT_OPTIONS,
  ];

  return (
    <aside
      className={cn("hidden w-[280px] shrink-0 lg:block", className)}
      aria-label="Filters"
    >
      <div className="sticky top-[120px] rounded-xl border border-[#eee] bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-[#333333]">Filters</h3>
        <FiltersContent />
      </div>
    </aside>
  );
}

/** Mobile floating button + Tablet filters trigger + Sheet. Use in toolbar or as floating. */
export function CollectionFiltersTrigger({
  value,
  onChange,
  sort,
  onSortChange,
  products = [],
  showRelevanceSort,
  onOpenChange,
}: {
  value: ProductFiltersState;
  onChange: (v: ProductFiltersState) => void;
  sort: SortValue;
  onSortChange: (v: SortValue) => void;
  products?: Product[];
  showRelevanceSort?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = countActive(value);

  const update = (patch: Partial<ProductFiltersState>) => {
    onChange({ ...value, ...patch });
  };

  const toggleSize = (size: string) => {
    const next = value.sizes.includes(size)
      ? value.sizes.filter((s) => s !== size)
      : [...value.sizes, size];
    update({ sizes: next });
  };

  const toggleColor = (color: string) => {
    const next = value.colors.includes(color)
      ? value.colors.filter((c) => c !== color)
      : [...value.colors, color];
    update({ colors: next });
  };

  const resetAll = () => {
    onChange({
      priceMin: 0,
      priceMax: DEFAULT_MAX,
      sizes: [],
      colors: [],
      material: "",
      minRating: 0,
      inStockOnly: false,
    });
    setMobileOpen(false);
    onOpenChange?.(false);
  };

  const sizeCounts = getSizeCounts(products);
  const sortOptions = [
    ...(showRelevanceSort ? [{ value: "relevance" as const, label: "Relevance" }] : []),
    ...SORT_OPTIONS,
  ];

  const FiltersContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#333333]">Price</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={value.priceMin || ""}
            onChange={(e) => update({ priceMin: Number(e.target.value) || 0 })}
            className="h-9"
          />
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={value.priceMax === DEFAULT_MAX ? "" : value.priceMax}
            onChange={(e) => update({ priceMax: Number(e.target.value) ? Number(e.target.value) : DEFAULT_MAX })}
            className="h-9"
          />
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#333333]">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.slice(0, 8).map((size) => (
            <label key={size} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={value.sizes.includes(size)}
                onChange={() => toggleSize(size)}
                className="h-4 w-4 rounded accent-[#C4A747]"
              />
              <span className="text-sm">{size}</span>
              {products.length > 0 && sizeCounts[size] !== undefined && (
                <span className="text-xs text-[#999]">({sizeCounts[size]})</span>
              )}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#333333]">Color</h4>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((color) => {
            const hex = COLOR_SWATCH_HEX[color];
            const selected = value.colors.includes(color);
            const isMulti = color === "Multi";
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                title={color}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition",
                  selected ? "scale-110 border-[#C4A747] ring-2 ring-[#C4A747]/30" : "border-transparent"
                )}
                style={isMulti ? { background: "linear-gradient(90deg,#ec4899,#3b82f6,#22c55e)" } : { backgroundColor: hex }}
                aria-pressed={selected}
              />
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#333333]">Material</h4>
        <Select value={value.material || "all"} onValueChange={(v) => update({ material: v === "all" ? "" : v })}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {MATERIAL_TYPES.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">In Stock Only</span>
        <button
          type="button"
          role="switch"
          aria-checked={value.inStockOnly}
          onClick={() => update({ inStockOnly: !value.inStockOnly })}
          className={cn(
            "relative h-6 w-11 rounded-full transition",
            value.inStockOnly ? "bg-[#C4A747]" : "bg-[#ddd]"
          )}
        >
          <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow", value.inStockOnly ? "left-6" : "left-1")} />
        </button>
      </div>
      {!compact && (
        <div className="space-y-2 border-t pt-4">
          <Button className="w-full" style={{ backgroundColor: GOLD }} onClick={() => { setMobileOpen(false); onOpenChange?.(false); }}>
            Apply Filters
          </Button>
          <Button variant="outline" className="w-full" onClick={resetAll}>Reset</Button>
        </div>
      )}
    </div>
  );

  const open = mobileOpen;
  const setOpen = (o: boolean) => {
    setMobileOpen(o);
    onOpenChange?.(o);
  };

  return (
    <>
      {/* Mobile: Floating button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 rounded-full px-6 shadow-lg" style={{ backgroundColor: GOLD }}>
              <Filter className="mr-2 h-5 w-5" />
              Filters & Sort
              {activeCount > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{activeCount}</span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Filters & Sort</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6 overflow-y-auto pb-8">
              <div>
                <p className="mb-2 text-sm font-semibold">Sort by</p>
                <Select value={sort} onValueChange={(v) => onSortChange(v as SortValue)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FiltersContent compact />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tablet: Filters button in toolbar */}
      <div className="hidden md:inline-flex lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="border-[#ddd] hover:border-[#C4A747]">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-xs text-white" style={{ backgroundColor: GOLD }}>
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

/** Toolbar with Sort and View toggle - use alongside CollectionFilters */
export function CollectionToolbar({
  sort,
  onSortChange,
  viewMode = "grid",
  onViewModeChange,
  showRelevanceSort,
}: {
  sort: SortValue;
  onSortChange: (v: SortValue) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (v: "grid" | "list") => void;
  showRelevanceSort?: boolean;
}) {
  const sortOptions = [
    ...(showRelevanceSort ? [{ value: "relevance" as const, label: "Relevance" }] : []),
    ...SORT_OPTIONS,
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select value={sort} onValueChange={(v) => onSortChange(v as SortValue)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onViewModeChange && (
        <div className="flex rounded-lg border border-[#ddd] p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "rounded p-2 transition",
              viewMode === "grid" ? "bg-[#C4A747]/20 text-[#C4A747]" : "text-[#999]"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "rounded p-2 transition",
              viewMode === "list" ? "bg-[#C4A747]/20 text-[#C4A747]" : "text-[#999]"
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

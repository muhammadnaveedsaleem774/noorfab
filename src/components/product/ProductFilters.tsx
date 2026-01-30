"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SIZE_OPTIONS, COLOR_OPTIONS, MATERIAL_TYPES, COLOR_SWATCH_HEX } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface ProductFiltersState {
  priceMin: number;
  priceMax: number;
  sizes: string[];
  colors: string[];
  material: string;
  minRating: number;
  inStockOnly: boolean;
}

const DEFAULT_FILTERS: ProductFiltersState = {
  priceMin: 0,
  priceMax: 100000,
  sizes: [],
  colors: [],
  material: "",
  minRating: 0,
  inStockOnly: false,
};

function countActive(f: ProductFiltersState): number {
  let n = 0;
  if (f.priceMin > 0 || f.priceMax < 100000) n++;
  if (f.sizes.length) n++;
  if (f.colors.length) n++;
  if (f.material) n++;
  if (f.minRating > 0) n++;
  if (f.inStockOnly) n++;
  return n;
}

interface ProductFiltersProps {
  value: ProductFiltersState;
  onChange: (value: ProductFiltersState) => void;
  className?: string;
}

export function ProductFilters({
  value,
  onChange,
  className,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = countActive(value);
  const hasActive = activeCount > 0;

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

  const clearAll = () => {
    onChange(DEFAULT_FILTERS);
    setMobileOpen(false);
  };

  const FiltersContent = () => (
    <div className="flex flex-col gap-6">
      {/* Price range */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[#333333]">Price</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={value.priceMin || ""}
            onChange={(e) =>
              update({ priceMin: Number(e.target.value) || 0 })
            }
            className="h-9 text-[#333333]"
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={value.priceMax === 100000 ? "" : value.priceMax}
            onChange={(e) =>
              update({
                priceMax: Number(e.target.value) ? Number(e.target.value) : 100000,
              })
            }
            className="h-9 text-[#333333]"
            aria-label="Maximum price"
          />
        </div>
      </div>

      {/* Size checkboxes */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[#333333]">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.slice(0, 8).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                "rounded border px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2",
                value.sizes.includes(size)
                  ? "border-[#C4A747] bg-[#C4A747]/10 text-[#333333]"
                  : "border-input bg-background text-[#333333] hover:border-[#C4A747]/50"
              )}
              aria-pressed={value.sizes.includes(size)}
              aria-label={`Filter by size ${size}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color swatches */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[#333333]">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => {
            const hex = COLOR_SWATCH_HEX[color];
            const isMulti = color === "Multi";
            const selected = value.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2",
                  selected ? "border-[#C4A747] ring-2 ring-[#C4A747]/30" : "border-gray-300"
                )}
                style={
                  isMulti
                    ? { background: hex }
                    : { backgroundColor: hex }
                }
                aria-pressed={selected}
                aria-label={`Filter by color ${color}`}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {/* Material select */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[#333333]">Material</h4>
        <Select
          value={value.material || "all"}
          onValueChange={(v) => update({ material: v === "all" ? "" : v })}
        >
          <SelectTrigger className="text-[#333333]" aria-label="Filter by material">
            <SelectValue placeholder="All materials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All materials</SelectItem>
            {MATERIAL_TYPES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating filter */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-[#333333]">Rating</h4>
        <Select
          value={value.minRating ? String(value.minRating) : "0"}
          onValueChange={(v) => update({ minRating: Number(v) })}
        >
          <SelectTrigger className="text-[#333333]" aria-label="Minimum rating">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="filter-stock"
          className="text-sm font-medium text-[#333333]"
        >
          In stock only
        </label>
        <button
          id="filter-stock"
          type="button"
          role="switch"
          aria-checked={value.inStockOnly}
          onClick={() => update({ inStockOnly: !value.inStockOnly })}
          className={cn(
            "relative h-6 w-11 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2",
            value.inStockOnly ? "bg-[#C4A747]" : "bg-muted"
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

      {hasActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="w-full text-[#333333] hover:text-[#C4A747] hover:border-[#C4A747]"
        >
          <X className="mr-2 h-4 w-4" aria-hidden />
          Clear All
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("lg:w-64 lg:shrink-0", className)}>
      {/* Desktop: sidebar */}
      <aside
        className="hidden w-full lg:block"
        aria-label="Product filters"
      >
        <div className="sticky top-24 space-y-1">
          {activeCount > 0 && (
            <p className="mb-2 text-xs font-medium text-[#C4A747]">
              {activeCount} filter{activeCount !== 1 ? "s" : ""} active
            </p>
          )}
          <FiltersContent />
        </div>
      </aside>

      {/* Mobile: sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden text-[#333333] border-[#333333]/20 hover:border-[#C4A747] hover:text-[#C4A747]"
            aria-label="Open filters"
          >
            <Filter className="mr-2 h-4 w-4" aria-hidden />
            Filters
            {activeCount > 0 && (
              <span className="ml-2 rounded-full bg-[#C4A747] px-2 py-0.5 text-xs font-medium text-[#333333]">
                {activeCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[#333333]">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {activeCount > 0 && (
              <p className="mb-4 text-xs font-medium text-[#C4A747]">
                {activeCount} filter{activeCount !== 1 ? "s" : ""} active
              </p>
            )}
            <FiltersContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { DEFAULT_FILTERS };

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
  { value: "bestselling", label: "Best Selling" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface ProductSortProps {
  value: SortValue;
  onValueChange: (value: SortValue) => void;
  "aria-label"?: string;
}

export function ProductSort({
  value,
  onValueChange,
  "aria-label": ariaLabel = "Sort products",
}: ProductSortProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as SortValue)}>
      <SelectTrigger
        className="w-[180px] text-[#333333]"
        aria-label={ariaLabel}
      >
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-[#333333] focus:bg-[#C4A747]/10 focus:text-[#C4A747]"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

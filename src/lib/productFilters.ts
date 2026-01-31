import type { Product } from "@/types";
import type { ProductFiltersState } from "@/components/product/ProductFilters";
import type { SortValue } from "@/components/product/ProductSort";

export function filterProducts(
  products: Product[],
  filters: ProductFiltersState
): Product[] {
  return products.filter((p) => {
    const price = p.salePrice ?? p.price;
    if (price < filters.priceMin || price > filters.priceMax) return false;
    if (filters.sizes.length && !p.variants.some((v) => filters.sizes.includes(v.size)))
      return false;
    if (filters.colors.length && !p.variants.some((v) => filters.colors.includes(v.color)))
      return false;
    if (filters.material && p.material !== filters.material) return false;
    if (filters.minRating > 0 && p.rating < filters.minRating) return false;
    if (filters.inStockOnly && !p.variants.some((v) => v.stock > 0)) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortValue): Product[] {
  const list = [...products];
  switch (sort) {
    case "relevance":
      return list; // API order
    case "price-asc":
      return list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case "price-desc":
      return list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "bestselling":
      // No sales data; keep order or could sort by rating as proxy
      return list.sort((a, b) => b.rating - a.rating);
    case "newest":
    default:
      return list;
  }
}

import type { Product } from "@/types";
import { PRODUCT_STATUS } from "@/lib/constants";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Cotton Tee",
    slug: "classic-cotton-tee",
    categoryId: "cat-tops",
    description: "Premium cotton t-shirt. Soft, breathable fabric perfect for everyday wear. Machine wash cold, tumble dry low.",
    price: 2999,
    salePrice: null,
    material: "Cotton",
    rating: 4.5,
    SKU: "ALT-CT-001",
    status: PRODUCT_STATUS.ACTIVE,
    images: [
      { url: "/hero-banner.jpg", altText: "Classic Cotton Tee", order: 0 },
     
    ],
    variants: [
      { size: "S", color: "White", stock: 10, variantSKU: "ALT-CT-001-S-W" },
      { size: "M", color: "White", stock: 15, variantSKU: "ALT-CT-001-M-W" },
      { size: "L", color: "Black", stock: 12, variantSKU: "ALT-CT-001-L-B" },
      { size: "M", color: "Sage", stock: 8, variantSKU: "ALT-CT-001-M-S" },
    ],
    
  },
  {
    id: "2",
    name: "Sage Linen Shirt",
    slug: "sage-linen-shirt",
    categoryId: "cat-shirts",
    description: "Light linen shirt in sage green. Natural fibre, ideal for warm weather. Dry clean or hand wash.",
    price: 5999,
    salePrice: null,
    material: "Linen",
    rating: 5,
    SKU: "ALT-SL-002",
    status: PRODUCT_STATUS.ACTIVE,
    images: [
      { url: "/product-1.jpg", altText: "Sage Linen Shirt", order: 0 },
    ],
    variants: [
      { size: "S", color: "Sage", stock: 5, variantSKU: "ALT-SL-002-S-S" },
      { size: "M", color: "Sage", stock: 7, variantSKU: "ALT-SL-002-M-S" },
      { size: "L", color: "Sage", stock: 4, variantSKU: "ALT-SL-002-L-S" },
    ],
  },
  {
    id: "3",
    name: "Lawn Kurti",
    slug: "lawn-kurti",
    categoryId: "lawn",
    description: "Elegant lawn kurti with delicate print. Light and comfortable for summer.",
    price: 4499,
    salePrice: 3999,
    material: "Cotton",
    rating: 4,
    SKU: "ALT-LK-003",
    status: PRODUCT_STATUS.ACTIVE,
    images: [
      { url: "/hero-banner12.jpg", altText: "Lawn Kurti", order: 0 },
    ],
    variants: [
      { size: "S", color: "Pink", stock: 6, variantSKU: "ALT-LK-003-S-P" },
      { size: "M", color: "Pink", stock: 9, variantSKU: "ALT-LK-003-M-P" },
      { size: "L", color: "Beige", stock: 0, variantSKU: "ALT-LK-003-L-B" },
    ],
  },
  {
    id: "4",
    name: "Cotton Palazzo",
    slug: "cotton-palazzo",
    categoryId: "cotton",
    description: "Flowy cotton palazzo pants. High waist, full length.",
    price: 3499,
    salePrice: null,
    material: "Cotton",
    rating: 4.5,
    SKU: "ALT-CP-004",
    status: PRODUCT_STATUS.ACTIVE,
    images: [
      { url: "/product-3.jpg", altText: "Cotton Palazzo", order: 0 },
    ],
    variants: [
      { size: "M", color: "White", stock: 11, variantSKU: "ALT-CP-004-M-W" },
      { size: "L", color: "Navy", stock: 8, variantSKU: "ALT-CP-004-L-N" },
    ],
  },
  {
    id: "5",
    name: "Linen Blend Dress",
    slug: "linen-blend-dress",
    categoryId: "linen",
    description: "Relaxed linen blend midi dress. Perfect for casual and semi-formal occasions.",
    price: 6999,
    salePrice: null,
    material: "Linen",
    rating: 5,
    SKU: "ALT-LBD-005",
    status: PRODUCT_STATUS.ACTIVE,
    images: [
      { url: "/product-4.jpg", altText: "Linen Blend Dress", order: 0 },
    ],
    variants: [
      { size: "S", color: "Cream", stock: 4, variantSKU: "ALT-LBD-005-S-C" },
      { size: "M", color: "Sage", stock: 7, variantSKU: "ALT-LBD-005-M-S" },
      { size: "L", color: "Brown", stock: 3, variantSKU: "ALT-LBD-005-L-B" },
    ],
  },
  {
    id: "6",
    name: "Festive Embroidered Top",
    slug: "festive-embroidered-top",
    categoryId: "festive",
    description: "Hand-embroidered festive top. Pair with palazzo or skirt for celebrations.",
    price: 7999,
    salePrice: 6499,
    material: "Silk",
    rating: 4.5,
    SKU: "ALT-FET-006",
    status: PRODUCT_STATUS.ACTIVE,
    images: [
      { url: "/hero-banner12.jpg", altText: "Festive Embroidered Top", order: 0 },
    ],
    variants: [
      { size: "S", color: "Burgundy", stock: 5, variantSKU: "ALT-FET-006-S-B" },
      { size: "M", color: "Burgundy", stock: 6, variantSKU: "ALT-FET-006-M-B" },
      { size: "L", color: "Gold", stock: 2, variantSKU: "ALT-FET-006-L-G" },
    ],
  },
];

export const COLLECTION_PRODUCT_IDS: Record<string, string[]> = {
  lawn: ["1", "2", "3"],
  cotton: ["1", "3", "4"],
  linen: ["2", "4", "5"],
  festive: ["5", "6"],
  "ready-to-wear": ["1", "2", "3", "4", "5", "6"],
  "new-arrivals": ["3", "5", "6"],
};

export const MOCK_COLLECTIONS = [
  { id: "col-lawn", name: "Lawn", slug: "lawn", description: "Light, breathable lawn for summer.", image: "/collection-cotton.jpg", displayOrder: 1 },
  { id: "col-cotton", name: "Cotton", slug: "cotton", description: "Pure cotton essentials.", image: "/collection-festive.jpg", displayOrder: 2 },
  { id: "col-linen", name: "Linen", slug: "linen", description: "Natural linen for everyday elegance.", image: "/collection-linen.jpg", displayOrder: 3 },
  { id: "col-festive", name: "Festive", slug: "festive", description: "Celebration-ready silhouettes.", image: "/product-4.jpg", displayOrder: 4 },
  { id: "col-rtw", name: "Ready-to-Wear", slug: "ready-to-wear", description: "Effortless everyday wear.", image: "/pro1.jpg", displayOrder: 5 },
  { id: "col-new", name: "New Arrivals", slug: "new-arrivals", description: "Fresh styles for the season.", image: "/pro2.jpg", displayOrder: 6 },
] as const;

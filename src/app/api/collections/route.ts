import { NextResponse } from "next/server";
import { MOCK_PRODUCTS, MOCK_COLLECTIONS, COLLECTION_PRODUCT_IDS } from "@/lib/mockData";

export interface CollectionListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  displayOrder: number;
}

export async function GET() {
  const byId = new Map(MOCK_PRODUCTS.map((p) => [p.id, p]));
  const list: CollectionListItem[] = MOCK_COLLECTIONS.map((c) => ({
    ...c,
    productCount: (COLLECTION_PRODUCT_IDS[c.slug] ?? []).filter((id) => byId.has(id)).length,
  })).sort((a, b) => a.displayOrder - b.displayOrder);
  return NextResponse.json(list);
}

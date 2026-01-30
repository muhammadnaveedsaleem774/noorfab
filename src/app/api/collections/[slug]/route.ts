import { NextResponse } from "next/server";
import { MOCK_PRODUCTS, MOCK_COLLECTIONS, COLLECTION_PRODUCT_IDS } from "@/lib/mockData";
import type { Product } from "@/types";

export interface CollectionWithProducts {
  collection: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    productCount: number;
  };
  products: Product[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const coll = MOCK_COLLECTIONS.find((c) => c.slug === slug);
  if (!coll) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

  const ids = COLLECTION_PRODUCT_IDS[slug] ?? [];
  const byId = new Map(MOCK_PRODUCTS.map((p) => [p.id, p]));
  const products = ids.map((id) => byId.get(id)).filter(Boolean) as Product[];

  const payload: CollectionWithProducts = {
    collection: {
      ...coll,
      productCount: products.length,
    },
    products,
  };
  return NextResponse.json(payload);
}

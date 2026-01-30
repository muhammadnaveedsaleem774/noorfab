import { NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/lib/mockData";

function matchesQuery(product: { name: string; description: string }, q: string): boolean {
  const lower = q.trim().toLowerCase();
  if (!lower) return true;
  return (
    product.name.toLowerCase().includes(lower) ||
    product.description.toLowerCase().includes(lower)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("id");
  const slug = searchParams.get("slug");
  const q = searchParams.get("q") ?? "";

  if (slug) {
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  }

  if (ids.length > 0) {
    const filtered = MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
    return NextResponse.json(filtered);
  }

  if (q.trim()) {
    const filtered = MOCK_PRODUCTS.filter((p) => matchesQuery(p, q));
    return NextResponse.json(filtered);
  }

  return NextResponse.json(MOCK_PRODUCTS);
}

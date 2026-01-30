"use client";

import { useQuery } from "react-query";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { CollectionListItem } from "@/app/api/collections/route";

async function fetchCollections(): Promise<CollectionListItem[]> {
  const res = await fetch("/api/collections");
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export default function CollectionsPage() {
  const { data: collections = [], isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-lg bg-muted"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive" role="alert">
        Unable to load collections. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#333333]">Collections</h1>
      <p className="text-muted-foreground">
        Explore our curated collections for every occasion.
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`${ROUTES.collections}/${c.slug}`}
            className="group relative block overflow-hidden rounded-lg border-2 border-transparent bg-muted transition-all duration-200 hover:border-[#C4A747] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C4A747] focus:ring-offset-2"
          >
            <div className="aspect-[4/5] relative bg-muted">
              <Image
                src={c.image}
                alt={c.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#333333]/90 to-transparent p-4 pt-12">
              <h2 className="font-semibold text-white">{c.name}</h2>
              <p className="text-sm text-white/80">
                {c.productCount} product{c.productCount !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

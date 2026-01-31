import { MetadataRoute } from "next";
import { ROUTES } from "@/lib/constants";
import { MOCK_PRODUCTS, MOCK_COLLECTIONS } from "@/lib/mockData";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noor-g.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}${ROUTES.shop}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}${ROUTES.collections}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}${ROUTES.search}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}${ROUTES.about}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.contact}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}${ROUTES.cart}`, lastModified: new Date(), changeFrequency: "always", priority: 0.5 },
    { url: `${baseUrl}${ROUTES.wishlist}`, lastModified: new Date(), changeFrequency: "always", priority: 0.5 },
  ];

  const productPages: MetadataRoute.Sitemap = MOCK_PRODUCTS.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionPages: MetadataRoute.Sitemap = MOCK_COLLECTIONS.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages, ...collectionPages];
}

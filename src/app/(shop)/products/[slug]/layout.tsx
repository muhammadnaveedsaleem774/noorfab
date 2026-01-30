import { Metadata } from "next";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { SITE_NAME } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product | " + SITE_NAME };
  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: product.description?.slice(0, 160) ?? `Shop ${product.name} at ${SITE_NAME}.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
    },
  };
}

export default function ProductSlugLayout({ children }: Props) {
  return <>{children}</>;
}

import { Metadata } from "next";
import { MOCK_COLLECTIONS } from "@/lib/mockData";
import { SITE_NAME } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

type CollectionItem = (typeof MOCK_COLLECTIONS)[number];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coll: CollectionItem | undefined = MOCK_COLLECTIONS.find((c) => c.slug === slug);
  if (!coll) {
    return { title: "Collection | " + SITE_NAME };
  }
  const name = coll.name;
  const description = coll.description ?? `Shop the ${name} collection at ${SITE_NAME}.`;
  return {
    title: `${name} Collection | ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${name} Collection`,
      description: coll.description,
    },
  };
}

export default function CollectionSlugLayout({ children }: Props) {
  return <>{children}</>;
}

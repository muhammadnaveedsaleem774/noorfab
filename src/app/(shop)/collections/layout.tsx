import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Collections | ${SITE_NAME}`,
  description: "Browse our clothing collections: Lawn, Cotton, Linen, Festive, and Ready-to-Wear.",
  openGraph: {
    title: `Collections | ${SITE_NAME}`,
    description: "Browse our clothing collections.",
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

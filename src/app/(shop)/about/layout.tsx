import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | NOOR-G",
  description:
    "Discover NOOR-G's story, mission, and fabric philosophy. Premium clothing crafted with care for the modern wardrobe.",
  openGraph: {
    title: "About Us | NOOR-G",
    description: "Our story, mission, and commitment to quality fabrics.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

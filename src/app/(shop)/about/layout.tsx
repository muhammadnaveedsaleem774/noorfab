import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | AL-NOOR",
  description:
    "Discover AL-NOOR's story, mission, and fabric philosophy. Premium clothing crafted with care for the modern wardrobe.",
  openGraph: {
    title: "About Us | AL-NOOR",
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

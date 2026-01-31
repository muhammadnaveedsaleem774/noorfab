import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | NOOR-G",
  description:
    "Get in touch with NOOR-G. Send us a message, find our address, working hours, and social links.",
  openGraph: {
    title: "Contact Us | NOOR-G",
    description: "Contact NOOR-G for enquiries, support, and feedback.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

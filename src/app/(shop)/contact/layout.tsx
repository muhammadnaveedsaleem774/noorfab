import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | AL-NOOR",
  description:
    "Get in touch with AL-NOOR. Send us a message, find our address, working hours, and social links.",
  openGraph: {
    title: "Contact Us | AL-NOOR",
    description: "Contact AL-NOOR for enquiries, support, and feedback.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

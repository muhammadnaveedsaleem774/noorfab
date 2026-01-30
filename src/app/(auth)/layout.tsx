import { Container } from "@/components/layout/Container";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-cream">
      <Container className="flex justify-center py-8">
        <div className="w-full max-w-md">{children}</div>
      </Container>
    </div>
  );
}

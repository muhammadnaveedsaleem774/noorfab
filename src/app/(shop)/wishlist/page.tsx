import { WishlistSummary } from "@/components/wishlist/WishlistSummary";

export default function WishlistPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary-dark">Wishlist</h1>
      <WishlistSummary />
    </div>
  );
}

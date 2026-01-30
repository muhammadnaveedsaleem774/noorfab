"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useCartStore, type CartStoreItem } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Container } from "@/components/layout/Container";
import {
  shippingAddressSchema,
  type ShippingAddressValues,
} from "@/lib/validations";

const GOLD = "#C4A747";
const STEPS = ["Authentication", "Shipping Address", "Review Order", "Confirmation"];

function generateOrderNumber(): string {
  return "ALN-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, getCartTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [isGuest, setIsGuest] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressValues | null>(null);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = getCartTotal();
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const canProceedFromAuth = isAuthenticated || isGuest;

  const shippingForm = useForm<ShippingAddressValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setStep(2);
  };

  const onShippingSubmit = (data: ShippingAddressValues) => {
    setShippingAddress(data);
    setStep(3);
  };

  const handlePlaceOrder = () => {
    if (!shippingAddress || items.length === 0) return;
    setIsPlacing(true);
    setStep(4);
    setTimeout(() => {
      setOrderNumber(generateOrderNumber());
      clearCart();
      setIsPlacing(false);
    }, 800);
  };

  if (items.length === 0 && step < 4) {
    return (
      <Container className="flex flex-col items-center justify-center gap-6 py-16">
        <h1 className="text-2xl font-bold text-[#333333]">Your cart is empty</h1>
        <p className="text-muted-foreground">Add items before checkout.</p>
        <Button asChild style={{ backgroundColor: GOLD, color: "#333333" }}>
          <Link href={ROUTES.shop}>Continue Shopping</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="narrow" className="max-w-2xl space-y-8 py-8">
      <h1 className="text-2xl font-bold text-[#333333]">Checkout</h1>

      {/* Step progress */}
      <nav aria-label="Checkout progress">
        <ol className="flex items-center justify-between gap-2 text-sm">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const active = step === stepNum;
            const done = step > stepNum;
            return (
              <li
                key={stepNum}
                className={`flex flex-1 items-center after:flex-1 after:border-b-2 after:content-[''] last:after:hidden ${
                  done ? "after:border-[#C4A747]" : "after:border-[#333333]/20"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium ${
                    active
                      ? "bg-[#C4A747] text-[#333333]"
                      : done
                        ? "bg-[#C4A747] text-[#333333]"
                        : "bg-[#333333]/10 text-[#333333]"
                  }`}
                >
                  {done ? "✓" : stepNum}
                </span>
                <span className="ml-2 hidden truncate sm:inline">
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Step {step} of 4
        </p>
      </nav>

      {/* Step 1: Authentication */}
      {step === 1 && (
        <section className="rounded-lg border border-[#333333]/10 bg-card p-8" aria-label="Authentication">
          <h2 className="text-lg font-semibold text-[#333333]">Sign in or continue as guest</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in for a faster checkout and to save your address.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <Button
              size="lg"
              className="w-full font-semibold"
              style={{ backgroundColor: GOLD, color: "#333333" }}
              onClick={() => signIn("google", { callbackUrl: ROUTES.checkout })}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Loading…" : "Sign in with Google"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-[#333333]/30 text-[#333333] hover:border-[#C4A747] hover:text-[#C4A747]"
              onClick={handleContinueAsGuest}
            >
              Continue as Guest
            </Button>
          </div>
          {canProceedFromAuth && (
            <Button
              className="mt-6 w-full"
              style={{ backgroundColor: GOLD, color: "#333333" }}
              onClick={() => setStep(2)}
            >
              Continue to Shipping
            </Button>
          )}
        </section>
      )}

      {/* Step 2: Shipping Address */}
      {step === 2 && (
        <section className="rounded-lg border border-[#333333]/10 bg-card p-8" aria-label="Shipping address">
          <h2 className="text-lg font-semibold text-[#333333]">Shipping Address</h2>
          <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-[#333333]">
                Full Name
              </label>
              <Input
                id="fullName"
                {...shippingForm.register("fullName")}
                className="border-[#333333]/20"
                placeholder="Full name"
              />
              {shippingForm.formState.errors.fullName && (
                <p className="mt-1 text-sm text-destructive">
                  {shippingForm.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[#333333]">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                {...shippingForm.register("phone")}
                className="border-[#333333]/20"
                placeholder="Phone number"
              />
              {shippingForm.formState.errors.phone && (
                <p className="mt-1 text-sm text-destructive">
                  {shippingForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="street" className="mb-1 block text-sm font-medium text-[#333333]">
                Street Address
              </label>
              <Input
                id="street"
                {...shippingForm.register("street")}
                className="border-[#333333]/20"
                placeholder="Street address"
              />
              {shippingForm.formState.errors.street && (
                <p className="mt-1 text-sm text-destructive">
                  {shippingForm.formState.errors.street.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="mb-1 block text-sm font-medium text-[#333333]">
                  City
                </label>
                <Input
                  id="city"
                  {...shippingForm.register("city")}
                  className="border-[#333333]/20"
                  placeholder="City"
                />
                {shippingForm.formState.errors.city && (
                  <p className="mt-1 text-sm text-destructive">
                    {shippingForm.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="mb-1 block text-sm font-medium text-[#333333]">
                  State / Province
                </label>
                <Input
                  id="state"
                  {...shippingForm.register("state")}
                  className="border-[#333333]/20"
                  placeholder="State"
                />
                {shippingForm.formState.errors.state && (
                  <p className="mt-1 text-sm text-destructive">
                    {shippingForm.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-[#333333]">
                  Postal Code
                </label>
                <Input
                  id="postalCode"
                  {...shippingForm.register("postalCode")}
                  className="border-[#333333]/20"
                  placeholder="Postal code"
                />
                {shippingForm.formState.errors.postalCode && (
                  <p className="mt-1 text-sm text-destructive">
                    {shippingForm.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="country" className="mb-1 block text-sm font-medium text-[#333333]">
                  Country
                </label>
                <Input
                  id="country"
                  {...shippingForm.register("country")}
                  className="border-[#333333]/20"
                  placeholder="Country"
                />
                {shippingForm.formState.errors.country && (
                  <p className="mt-1 text-sm text-destructive">
                    {shippingForm.formState.errors.country.message}
                  </p>
                )}
              </div>
            </div>
            {isAuthenticated && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={saveAddressForFuture}
                  onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                  className="rounded border-[#333333]/30 text-[#C4A747] focus:ring-[#C4A747]"
                />
                <span className="text-sm text-[#333333]">Save address for future orders</span>
              </label>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="border-[#333333]/30"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                style={{ backgroundColor: GOLD, color: "#333333" }}
              >
                Continue to Review
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Step 3: Review Order */}
      {step === 3 && shippingAddress && (
        <section className="space-y-6" aria-label="Review order">
          <div className="rounded-lg border border-[#333333]/10 bg-card p-6">
            <h2 className="text-lg font-semibold text-[#333333]">Shipping Address</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {shippingAddress.fullName}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}<br />
              {shippingAddress.phone}
            </p>
            <Button
              variant="link"
              className="mt-2 p-0 text-[#C4A747] hover:text-[#C4A747]/80"
              onClick={() => setStep(2)}
            >
              Edit address
            </Button>
          </div>
          <div className="rounded-lg border border-[#333333]/10 bg-card p-6">
            <h2 className="text-lg font-semibold text-[#333333]">Order items</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item: CartStoreItem) => {
                const v = item.product.variants.find((x) => x.variantSKU === item.variantSKU);
                const lineTotal = (item.product.salePrice ?? item.product.price) * item.quantity;
                return (
                  <li key={item.id} className="flex gap-3 border-b border-[#333333]/10 pb-3 last:border-0 last:pb-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={item.product.images[0]?.url ?? "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#333333]">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {v?.size} / {v?.color} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-[#333333]">{formatPrice(lineTotal)}</p>
                  </li>
                );
              })}
            </ul>
            <Button
              variant="link"
              className="mt-2 p-0 text-[#C4A747] hover:text-[#C4A747]/80"
              asChild
            >
              <Link href={ROUTES.cart}>Edit cart</Link>
            </Button>
          </div>
          <div className="rounded-lg border border-[#333333]/10 bg-card p-6">
            <h2 className="text-lg font-semibold text-[#333333]">Payment</h2>
            <p className="mt-2 text-sm text-muted-foreground">Cash on Delivery</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-muted-foreground">Calculated at delivery</dd>
              </div>
              <div className="flex justify-between border-t border-[#333333]/10 pt-3 text-lg font-bold text-[#333333]">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button
              className="mt-6 w-full"
              size="lg"
              style={{ backgroundColor: GOLD, color: "#333333" }}
              onClick={handlePlaceOrder}
              disabled={isPlacing}
            >
              {isPlacing ? "Placing order…" : "Place Order"}
            </Button>
          </div>
        </section>
      )}

      {/* Step 4: Placing order (brief loading) */}
      {step === 4 && !orderNumber && (
        <section className="rounded-lg border border-[#333333]/10 bg-card p-12 text-center">
          <p className="text-muted-foreground">Placing your order…</p>
        </section>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && orderNumber && (
        <section
          className="flex flex-col items-center rounded-lg border border-[#333333]/10 bg-card p-8 text-center"
          aria-label="Order confirmation"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white"
            aria-hidden
          >
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#333333]">Order placed successfully</h2>
          <p className="mt-2 text-muted-foreground">Thank you for your order.</p>
          <p className="mt-4 text-sm font-medium text-[#333333]">Order number</p>
          <p className="text-xl font-bold text-[#C4A747]" aria-live="polite">
            {orderNumber}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            A confirmation email has been sent to your email address.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="border-[#333333]/30">
              <Link href={ROUTES.account}>View Order Details</Link>
            </Button>
            <Button asChild style={{ backgroundColor: GOLD, color: "#333333" }}>
              <Link href={ROUTES.shop}>Continue Shopping</Link>
            </Button>
          </div>
        </section>
      )}
    </Container>
  );
}

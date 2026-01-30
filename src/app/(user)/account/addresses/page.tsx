"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import type { Address } from "@/types";
import { shippingAddressSchema, type ShippingAddressValues } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const GOLD = "#C4A747";

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    userId: "user-1",
    fullName: "Jane Doe",
    phone: "+1234567890",
    street: "123 Main St",
    city: "Lahore",
    state: "Punjab",
    postalCode: "54000",
    country: "Pakistan",
    isDefault: true,
  },
];

function generateId(): string {
  return "addr-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ShippingAddressValues>({
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

  const openAdd = () => {
    setEditingId(null);
    form.reset({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });
    setSheetOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    form.reset({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setSheetOpen(true);
  };

  const onSubmit = (data: ShippingAddressValues) => {
    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, ...data }
            : a
        )
      );
    } else {
      const newAddr: Address = {
        id: generateId(),
        userId: "user-1",
        ...data,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
    }
    setSheetOpen(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const remove = (id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length > 0 && next.every((a) => !a.isDefault)) {
        next[0].isDefault = true;
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#333333]">Addresses</h1>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button style={{ backgroundColor: GOLD, color: "#333333" }} onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-[#333333]">
                {editingId ? "Edit address" : "Add new address"}
              </SheetTitle>
            </SheetHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">Full Name</label>
                <Input {...form.register("fullName")} className="border-[#333333]/20" />
                {form.formState.errors.fullName && (
                  <p className="mt-1 text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">Phone</label>
                <Input type="tel" {...form.register("phone")} className="border-[#333333]/20" />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#333333]">Street</label>
                <Input {...form.register("street")} className="border-[#333333]/20" />
                {form.formState.errors.street && (
                  <p className="mt-1 text-sm text-destructive">{form.formState.errors.street.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#333333]">City</label>
                  <Input {...form.register("city")} className="border-[#333333]/20" />
                  {form.formState.errors.city && (
                    <p className="mt-1 text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#333333]">State</label>
                  <Input {...form.register("state")} className="border-[#333333]/20" />
                  {form.formState.errors.state && (
                    <p className="mt-1 text-sm text-destructive">{form.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#333333]">Postal Code</label>
                  <Input {...form.register("postalCode")} className="border-[#333333]/20" />
                  {form.formState.errors.postalCode && (
                    <p className="mt-1 text-sm text-destructive">{form.formState.errors.postalCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#333333]">Country</label>
                  <Input {...form.register("country")} className="border-[#333333]/20" />
                  {form.formState.errors.country && (
                    <p className="mt-1 text-sm text-destructive">{form.formState.errors.country.message}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" style={{ backgroundColor: GOLD, color: "#333333" }}>
                  {editingId ? "Save changes" : "Add address"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center">
          <p className="text-muted-foreground">No saved addresses.</p>
          <Button className="mt-4" style={{ backgroundColor: GOLD, color: "#333333" }} onClick={openAdd}>
            Add your first address
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <li key={addr.id}>
              <Card
                className={cn(
                  "h-full transition",
                  addr.isDefault ? "border-2 border-[#C4A747]" : "border-[#333333]/10"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium text-[#333333]">
                    {addr.fullName}
                    {addr.isDefault && (
                      <span className="ml-2 inline-flex items-center rounded bg-[#C4A747]/20 px-2 py-0.5 text-xs font-medium text-[#333333]">
                        Default
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <address className="not-italic text-sm text-muted-foreground">
                    {addr.street}<br />
                    {addr.city}, {addr.state} {addr.postalCode}<br />
                    {addr.country}<br />
                    {addr.phone}
                  </address>
                  <div className="flex flex-wrap gap-2">
                    {!addr.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#333333]/20"
                        onClick={() => setDefault(addr.id)}
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#333333]/20"
                      onClick={() => openEdit(addr)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(addr.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

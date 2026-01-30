"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useUserStore } from "@/store/userStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GOLD = "#C4A747";

type ProfileForm = { phone: string };

export default function AccountProfilePage() {
  const { data: session } = useSession();
  const { user, updateProfile } = useUserStore();
  const [saved, setSaved] = useState(false);

  const displayName = session?.user?.name ?? user?.fullName ?? "";
  const displayEmail = session?.user?.email ?? user?.email ?? "";
  const displayImage = session?.user?.image ?? user?.profileImage ?? null;
  const storedPhone = user?.phone ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { phone: storedPhone },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfile({ phone: data.phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#333333]">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#333333]">Your information</CardTitle>
          <CardDescription>Manage your account details (OAuth profile is read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-muted">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayName || "Profile"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#333333]">
                  {displayName?.charAt(0) ?? "?"}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="font-medium text-[#333333]">{displayName || "—"}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium text-[#333333]">{displayEmail || "—"}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[#333333]">
                Phone number
              </label>
              <Input
                id="phone"
                type="tel"
                {...register("phone", { required: false })}
                className="max-w-xs border-[#333333]/20"
                placeholder="Your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <Button
              type="submit"
              style={{ backgroundColor: GOLD, color: "#333333" }}
            >
              {saved ? "Saved" : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

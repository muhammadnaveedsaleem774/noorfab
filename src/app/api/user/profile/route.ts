import { NextResponse } from "next/server";
import { USER_ROLE } from "@/lib/constants";
import type { User } from "@/types";

/** PATCH /api/user/profile - update profile (stub) */
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { fullName, phone } = body as { fullName?: string; phone?: string };
  const user: User = {
    id: "user-1",
    googleId: "google-1",
    email: "user@example.com",
    fullName: fullName ?? "User",
    phone: phone ?? null,
    profileImage: null,
    role: USER_ROLE.CUSTOMER,
    status: "ACTIVE",
  };
  return NextResponse.json(user);
}

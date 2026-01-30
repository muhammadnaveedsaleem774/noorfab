import { NextResponse } from "next/server";
import type { Address } from "@/types";

const MOCK_ADDRESSES: Address[] = [
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
  {
    id: "addr-2",
    userId: "user-1",
    fullName: "Jane Doe",
    phone: "+1234567890",
    street: "456 Oak Ave",
    city: "Karachi",
    state: "Sindh",
    postalCode: "75500",
    country: "Pakistan",
    isDefault: false,
  },
];

/** GET /api/user/addresses - list addresses (stub) */
export async function GET() {
  return NextResponse.json(MOCK_ADDRESSES);
}

/** POST /api/user/addresses - add address (stub) */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const address: Address = {
    id: `addr-${Date.now()}`,
    userId: "user-1",
    fullName: body.fullName ?? "",
    phone: body.phone ?? "",
    street: body.street ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    postalCode: body.postalCode ?? "",
    country: body.country ?? "",
    isDefault: body.isDefault ?? false,
  };
  return NextResponse.json(address);
}

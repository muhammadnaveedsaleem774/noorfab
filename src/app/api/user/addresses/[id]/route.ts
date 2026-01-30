import { NextResponse } from "next/server";
import type { Address } from "@/types";

/** PATCH /api/user/addresses/[id] - update address (stub) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const address: Address = {
    id,
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

/** DELETE /api/user/addresses/[id] - delete address (stub) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return new NextResponse(null, { status: 204 });
}

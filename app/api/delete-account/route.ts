import { NextResponse } from "next/server";

import { APP_ENV } from "@/src/config/env";

const normalizePhone = (phone: string) =>
  String(phone || "")
    .replace(/\D/g, "")
    .slice(-10);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      fullName: String(body?.fullName || "").trim(),
      reason: String(body?.reason || "").trim(),
      registeredPhoneNumber: normalizePhone(body?.registeredPhoneNumber || ""),
      role: String(body?.role || "").trim(),
      schoolName: String(body?.schoolName || "").trim(),
    };

    const response = await fetch(
      `${APP_ENV.API_URL}/public/delete-account-requests`,
      {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data?.message || "Unable to submit delete account request",
          success: false,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        data: data?.data || null,
        message: data?.message || "Delete account request submitted",
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to submit delete account request",
        success: false,
      },
      { status: 500 },
    );
  }
}

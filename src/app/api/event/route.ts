import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function GET(_request: NextRequest) {
  try {
    const backendUrl = `${API_CONFIG.BASE_URL}/event`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Do not forward credentials for public events
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = [];
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, error: "پاسخ نامعتبر از سرور" },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: json?.message || "خطا در دریافت رویدادها" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, events: json });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

// Cache the events list for 10 minutes. Landing page data is not realtime.
export const revalidate = 600;

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
      next: { revalidate: 600 },
      cache: "force-cache",
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

    // Normalize the response - handle different response formats
    // Backend might return: array, { events: [...] }, { data: [...] }, etc.
    let eventsArray: any[] = [];
    if (Array.isArray(json)) {
      eventsArray = json;
    } else if (json && typeof json === "object") {
      eventsArray = json.events ?? json.data ?? json.items ?? [];
    }

    // Ensure eventsArray is always an array
    if (!Array.isArray(eventsArray)) {
      eventsArray = [];
    }

    const response = NextResponse.json({ success: true, events: eventsArray });
    response.headers.set(
      "Cache-Control",
      "s-maxage=600, stale-while-revalidate=60"
    );
    return response;
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}

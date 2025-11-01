import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const backendUrl = `${API_CONFIG.BASE_URL}/event/${eventId}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = {};
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
        {
          success: false,
          error: json?.message || json?.error || "رویداد یافت نشد",
        },
        { status: res.status }
      );
    }

    // Normalize the response - handle different response formats
    const event = json?.event || json?.data || json;

    return NextResponse.json({ success: true, event });
  } catch (e) {
    console.error("Error fetching event detail:", e);
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}


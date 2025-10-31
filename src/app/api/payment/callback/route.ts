import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

// This is a public endpoint called by Zarinpal after payment
// It doesn't require authentication
export async function GET(request: NextRequest) {
  try {
    // Get parameters from query string (Zarinpal sends Authority and Status)
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    if (!authority) {
      return NextResponse.json(
        { success: false, error: "Authority parameter is required" },
        { status: 400 }
      );
    }

    // Call backend callback endpoint (public - no auth needed)
    const backendRes = await fetch(
      `${API_CONFIG.BASE_URL}/payment/callback?Authority=${authority}&Status=${status || ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const text = await backendRes.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    // Return backend response
    return NextResponse.json(json as any, { status: backendRes.status });
  } catch (e) {
    console.error("Payment callback error:", e);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}





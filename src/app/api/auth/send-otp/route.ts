import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Send OTP API called");
    console.log(
      "📋 Request headers:",
      Object.fromEntries(request.headers.entries())
    );

    const body = await request.json();
    const { phone } = body;

    console.log("📱 Received phone:", phone);
    console.log("📋 Request body:", body);

    if (!phone) {
      console.log("❌ No phone provided");
      return NextResponse.json(
        { success: false, error: "شماره موبایل الزامی است" },
        { status: 400 }
      );
    }

    // Validate phone number
    if (phone.length !== 11 || !phone.startsWith("09")) {
      console.log("❌ Invalid phone format:", phone);
      return NextResponse.json(
        { success: false, error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    console.log("✅ Phone validation passed, calling backend API...");
    console.log(
      "🔗 Backend URL:",
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SEND_OTP}`
    );

    // Call your backend API directly with fetch
    const backendResponse = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SEND_OTP}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ phone }),
        credentials: "include", // Include cookies in the request
      }
    );

    console.log("🔗 Backend response status:", backendResponse.status);
    console.log(
      "🔗 Backend response headers:",
      Object.fromEntries(backendResponse.headers.entries())
    );

    const backendData = await backendResponse.text();
    console.log("🔗 Backend response body (raw):", backendData);

    let backendJson;
    try {
      backendJson = JSON.parse(backendData);
      console.log("🔗 Backend response body (parsed):", backendJson);
    } catch (parseError) {
      console.log("❌ Failed to parse backend response as JSON:", parseError);
      return NextResponse.json(
        { success: false, error: "پاسخ نامعتبر از سرور" },
        { status: 500 }
      );
    }

    if (backendResponse.ok && backendJson) {
      console.log("✅ OTP sent successfully");
      return NextResponse.json({
        success: true,
        message: "کد تایید ارسال شد",
        backendResponse: backendJson,
      });
    } else {
      console.log("❌ Backend API error:", backendJson);
      return NextResponse.json(
        {
          success: false,
          error: backendJson.message || "خطا در ارسال کد تایید",
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("💥 Send OTP API error:", error);
    console.error("💥 Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "خطا در ارسال کد تایید" },
      { status: 500 }
    );
  }
}

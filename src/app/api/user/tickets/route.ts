import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 User Tickets API called");

    // Get token from cookies
    const accessToken = request.cookies.get("access_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    const token = accessToken || authToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "احراز هویت مورد نیاز است" },
        { status: 401 }
      );
    }

    // Optional filters
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const ticketNumber = searchParams.get("ticketNumber");

    let target = `${API_CONFIG.BASE_URL}/ticket/my-tickets`;
    if (ticketNumber) {
      target = `${API_CONFIG.BASE_URL}/ticket/my-tickets/${encodeURIComponent(
        ticketNumber
      )}`;
    } else if (eventId) {
      target = `${
        API_CONFIG.BASE_URL
      }/ticket/my-tickets/event/${encodeURIComponent(eventId)}`;
    }

    // Call your backend API
    const backendResponse = await fetch(target, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Include cookies in the request
    });

    console.log("🔗 Backend response status:", backendResponse.status);

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
      console.log("✅ User tickets fetched successfully");
      // Normalize various possible shapes into a flat tickets array
      const normalizedTickets = Array.isArray(backendJson)
        ? backendJson
        : backendJson.tickets ??
          (backendJson.data && (backendJson.data as any).tickets) ??
          backendJson.data ??
          (backendJson.items as any) ??
          [];
      return NextResponse.json({
        success: true,
        tickets: normalizedTickets || [],
        message: "بلیط‌های کاربر با موفقیت دریافت شدند",
      });
    } else {
      console.log("❌ Backend API error:", backendJson);
      return NextResponse.json(
        {
          success: false,
          error: backendJson.message || "خطا در دریافت بلیط‌های کاربر",
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("💥 User Tickets API error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}

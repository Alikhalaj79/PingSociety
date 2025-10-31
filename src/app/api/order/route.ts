import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Order API called");

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

    // Fetch current user's orders from backend
    const backendResponse = await fetch(
      `${API_CONFIG.BASE_URL}/order/my-orders`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

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
      console.log("✅ User orders fetched successfully");

      // Normalize the response - handle different response formats
      const normalizedOrders = Array.isArray(backendJson)
        ? backendJson
        : backendJson.orders ?? backendJson.data ?? backendJson.items ?? [];

      // Convert relative image URLs to absolute URLs if needed
      const processedOrders = normalizedOrders.map(
        (order: Record<string, unknown>) => {
          if (
            order?.event &&
            typeof order.event === "object" &&
            order.event !== null
          ) {
            const event = order.event as Record<string, unknown>;
            if (event.image && typeof event.image === "string") {
              const imageUrl = event.image;
              // If image URL is relative, convert to absolute
              if (!imageUrl.startsWith("http") && !imageUrl.startsWith("//")) {
                // Check if it starts with a slash (absolute path)
                if (imageUrl.startsWith("/")) {
                  event.image = `${API_CONFIG.BASE_URL}${imageUrl}`;
                } else {
                  // Relative path
                  event.image = `${API_CONFIG.BASE_URL}/${imageUrl}`;
                }
              }
            }
          }
          return order;
        }
      );

      return NextResponse.json({
        success: true,
        orders: processedOrders,
      });
    } else {
      console.log("❌ Backend API error:", backendJson);
      return NextResponse.json(
        {
          success: false,
          error: backendJson.message || "خطا در دریافت سفارشات کاربر",
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("💥 Order API error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}

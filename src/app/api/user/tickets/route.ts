import { NextRequest, NextResponse } from "next/server";

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

    // Call your backend API
    const backendResponse = await fetch(
      "https://pingsociety.liara.run/ticket/user",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
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
      console.log("✅ User tickets fetched successfully");
      return NextResponse.json({
        success: true,
        tickets: backendJson.tickets || backendJson || [],
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

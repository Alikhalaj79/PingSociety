import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 User Me API called");
    console.log(
      "📋 Request headers:",
      Object.fromEntries(request.headers.entries())
    );

    // Get token from cookies
    const accessToken = request.cookies.get("access_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    const token = accessToken || authToken;

    console.log(
      "🍪 Access token from cookies:",
      accessToken ? "Present" : "Not found"
    );
    console.log(
      "🍪 Auth token from cookies:",
      authToken ? "Present" : "Not found"
    );
    console.log("🔑 Using token:", token ? "Present" : "Not found");

    if (!token) {
      console.log("❌ No token found, returning 401");
      return NextResponse.json(
        {
          success: false,
          error: "احراز هویت مورد نیاز است",
          isAuthenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    console.log("✅ Token found, calling backend API...");

    // Call your backend API using BASE_URL + endpoint
    const backendUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_ME}`;
    console.log("🔗 Backend URL:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Include cookies in the request
    });

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
      console.log(
        "🔗 Backend response body (parsed):",
        JSON.stringify(backendJson, null, 2)
      );
    } catch (parseError) {
      console.log("❌ Failed to parse backend response as JSON:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "پاسخ نامعتبر از سرور",
          isAuthenticated: false,
          user: null,
        },
        { status: 500 }
      );
    }

    if (backendResponse.ok && backendJson) {
      console.log("✅ Backend response successful");
      return NextResponse.json({
        success: true,
        isAuthenticated: true,
        user: backendJson,
        message: "کاربر احراز هویت شده است",
      });
    } else {
      console.log("❌ Backend response failed:", backendJson);
      return NextResponse.json(
        {
          success: false,
          error: backendJson?.message || "خطا در احراز هویت",
          isAuthenticated: false,
          user: null,
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("💥 User Me API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در سرور",
        isAuthenticated: false,
        user: null,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
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

    const body = await request.json();

    const backendUrl = `${API_CONFIG.BASE_URL}/users/me`;

    const backendResponse = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.text();
    let backendJson: any;
    try {
      backendJson = JSON.parse(backendData);
    } catch {
      return NextResponse.json(
        { success: false, error: "پاسخ نامعتبر از سرور" },
        { status: 500 }
      );
    }

    if (backendResponse.ok) {
      return NextResponse.json({
        success: true,
        user: backendJson.user || backendJson,
        message: "پروفایل با موفقیت به‌روزرسانی شد",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: backendJson?.message || "خطا در به‌روزرسانی پروفایل",
      },
      { status: backendResponse.status }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در ارتباط با سرور" },
      { status: 500 }
    );
  }
}

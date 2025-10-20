import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Token Refresh API called");

    // Get refresh token from cookies
    const refreshToken = request.cookies.get("refresh_token")?.value;

    console.log(
      "🍪 Refresh token from cookies:",
      refreshToken ? "Present" : "Not found"
    );

    if (!refreshToken) {
      console.log("❌ No refresh token found, returning 401");
      return NextResponse.json(
        {
          success: false,
          error: "Refresh token not found",
          isAuthenticated: false,
        },
        { status: 401 }
      );
    }

    console.log("✅ Refresh token found, calling backend API...");

    // Call backend refresh endpoint
    const backendUrl = `${API_CONFIG.BASE_URL}/auth/refresh-token`;
    console.log("🔗 Backend URL:", backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ refreshToken }).toString(),
      credentials: "include",
    });

    // console.log("🔗 Backend response status:", backendResponse.status);

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
          error: "Invalid response from server",
          isAuthenticated: false,
        },
        { status: 500 }
      );
    }

    if (backendResponse.ok && backendJson) {
      console.log("✅ Token refresh successful");

      // Set new tokens in cookies
      const response = NextResponse.json({
        success: true,
        isAuthenticated: true,
        message: "Token refreshed successfully",
      });

      // Set new access token (check different possible field names)
      const newAccessToken =
        backendJson.access_token ||
        backendJson.accessToken ||
        backendJson.token;
      if (newAccessToken) {
        response.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60, // 1 hour
        });
        console.log("✅ New access token set in cookie");
      }

      // Set new refresh token if provided (check different possible field names)
      const newRefreshToken =
        backendJson.refresh_token || backendJson.refreshToken;
      if (newRefreshToken) {
        response.cookies.set("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        console.log("✅ New refresh token set in cookie");
      }

      return response;
    } else {
      console.log("❌ Backend refresh failed:", backendJson);

      // Check if refresh token is also expired
      if (backendResponse.status === 401) {
        console.log("🔄 Refresh token also expired, clearing all cookies");

        const response = NextResponse.json(
          {
            success: false,
            error: "Refresh token expired. Please login again.",
            isAuthenticated: false,
            requiresLogin: true,
          },
          { status: 401 }
        );

        // Clear all authentication cookies
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");

        return response;
      }

      // Other errors
      const response = NextResponse.json(
        {
          success: false,
          error: backendJson?.message || "Token refresh failed",
          isAuthenticated: false,
        },
        { status: backendResponse.status }
      );

      return response;
    }
  } catch (error) {
    console.error("💥 Token Refresh API error:", error);

    const response = NextResponse.json(
      {
        success: false,
        error: "Server error during token refresh",
        isAuthenticated: false,
      },
      { status: 500 }
    );

    // Don't clear cookies on server error - only clear on 401 from backend
    return response;
  }
}

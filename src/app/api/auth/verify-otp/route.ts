import { NextRequest, NextResponse } from "next/server";
import { apiService } from "@/services/api";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Verify OTP API called");
    console.log(
      "📋 Request headers:",
      Object.fromEntries(request.headers.entries())
    );

    const body = await request.json();
    const { phone, otp, otpId } = body;

    console.log("📱 Received phone:", phone, "OTP:", otp);
    console.log("📋 Request body:", body);

    if (!phone || !otp) {
      console.log("❌ Missing phone or OTP");
      return NextResponse.json(
        { success: false, error: "شماره موبایل و کد تایید الزامی است" },
        { status: 400 }
      );
    }

    // Validate OTP
    if (otp.length !== 6) {
      console.log("❌ Invalid OTP length:", otp.length);
      return NextResponse.json(
        { success: false, error: "کد تایید باید ۶ رقم باشد" },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed, calling backend API...");
    console.log(
      "🔗 Backend URL:",
      "https://pingsociety.liara.run/auth/verify-otp"
    );

    // Call your backend API directly with fetch
    const backendResponse = await fetch(
      "https://pingsociety.liara.run/auth/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ phone, code: otp }), // Note: backend expects 'code' not 'otp'
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
      console.log("✅ OTP verified successfully");

      // Create response with backend data
      const nextResponse = NextResponse.json({
        success: true,
        message: "ورود موفقیت‌آمیز",
        user: backendJson.user || { id: "user-id", phone: phone },
        backendResponse: backendJson,
      });

      // Copy cookies from backend response to frontend response
      const setCookieHeader = backendResponse.headers.get("set-cookie");
      if (setCookieHeader) {
        console.log("🍪 Backend set-cookie header:", setCookieHeader);

        // Parse and set cookies from backend
        const cookies = setCookieHeader
          .split(",")
          .map((cookie) => cookie.trim());
        cookies.forEach((cookie) => {
          const [nameValue, ...attributes] = cookie.split(";");
          const [name, value] = nameValue.split("=");

          if (name && value) {
            const cookieOptions: any = {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            };

            // Parse cookie attributes
            attributes.forEach((attr) => {
              const [attrName, attrValue] = attr.trim().split("=");
              switch (attrName.toLowerCase()) {
                case "max-age":
                  cookieOptions.maxAge = parseInt(attrValue);
                  break;
                case "expires":
                  cookieOptions.expires = new Date(attrValue);
                  break;
                case "path":
                  cookieOptions.path = attrValue;
                  break;
                case "domain":
                  cookieOptions.domain = attrValue;
                  break;
                case "secure":
                  cookieOptions.secure = true;
                  break;
                case "samesite":
                  cookieOptions.sameSite = attrValue;
                  break;
              }
            });

            nextResponse.cookies.set(name.trim(), value.trim(), cookieOptions);
            console.log(`🍪 Cookie set: ${name.trim()}`);
          }
        });
      } else {
        console.log("⚠️ No set-cookie header from backend");

        // Fallback: Set cookies manually if backend doesn't set them
        if (backendJson.accessToken) {
          nextResponse.cookies.set("access_token", backendJson.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
          console.log("🍪 Fallback: Access token cookie set");
        }

        if (backendJson.refreshToken) {
          nextResponse.cookies.set("refresh_token", backendJson.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
          console.log("🍪 Fallback: Refresh token cookie set");
        }

        if (backendJson.token && !backendJson.accessToken) {
          nextResponse.cookies.set("auth_token", backendJson.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
          console.log("🍪 Fallback: Legacy auth token cookie set");
        }
      }

      return nextResponse;
    } else {
      console.log("❌ Backend API error:", backendJson);
      return NextResponse.json(
        {
          success: false,
          error: backendJson.message || "کد تایید نامعتبر است",
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("💥 Verify OTP API error:", error);
    console.error("💥 Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "خطا در تایید کد" },
      { status: 500 }
    );
  }
}

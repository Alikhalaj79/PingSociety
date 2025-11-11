import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🚀 Logout API called");

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "خروج موفقیت‌آمیز",
    });

    // Clear all auth cookies - try different paths and domains to ensure complete cleanup
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0, // Expire immediately
      path: "/",
    };

    // Clear all possible auth cookies
    const cookiesToClear = [
      "access_token",
      "refresh_token",
      "auth_token",
      "token",
      "session",
      "sessionId",
    ];

    cookiesToClear.forEach((cookieName) => {
      // Clear with default path
      response.cookies.set(cookieName, "", cookieOptions);
      // Also try clearing with root path explicitly
      response.cookies.set(cookieName, "", { ...cookieOptions, path: "/" });
    });

    console.log("✅ Logout successful, cookies cleared");

    return response;
  } catch (error) {
    console.error("💥 Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در خروج" },
      { status: 500 }
    );
  }
}





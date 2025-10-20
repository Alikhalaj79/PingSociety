import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🚀 Logout API called");

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "خروج موفقیت‌آمیز",
    });

    // Clear all auth cookies
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    });

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
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





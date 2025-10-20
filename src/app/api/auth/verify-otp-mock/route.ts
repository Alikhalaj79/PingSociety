import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    console.log("📱 Mock: Received phone:", phone, "OTP:", otp);

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل و کد تایید الزامی است" },
        { status: 400 }
      );
    }

    // Validate OTP
    if (otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "کد تایید باید ۶ رقم باشد" },
        { status: 400 }
      );
    }

    // Mock successful verification (accept any 6-digit OTP)
    console.log("✅ Mock: OTP verified successfully for", phone);

    // Set HTTP-only cookie for token
    const nextResponse = NextResponse.json({
      success: true,
      message: "ورود موفقیت‌آمیز (Mock)",
      user: {
        id: "mock-user-id",
        phone: phone,
        name: "کاربر تست",
      },
      mock: true,
    });

    // Set mock token cookie
    nextResponse.cookies.set("auth_token", "mock-jwt-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return nextResponse;
  } catch (error) {
    console.error("💥 Mock verify API error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در تایید کد" },
      { status: 500 }
    );
  }
}









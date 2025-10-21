import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    console.log("📱 Mock: Received phone:", phone);

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل الزامی است" },
        { status: 400 }
      );
    }

    // Validate phone number
    if (phone.length !== 11 || !phone.startsWith("09")) {
      return NextResponse.json(
        { success: false, error: "شماره موبایل نامعتبر است" },
        { status: 400 }
      );
    }

    // Mock successful response
    console.log("✅ Mock: OTP sent successfully for", phone);

    return NextResponse.json({
      success: true,
      message: "کد تایید ارسال شد (Mock)",
      mock: true,
    });
  } catch (error) {
    console.error("💥 Mock API error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در ارسال کد تایید" },
      { status: 500 }
    );
  }
}










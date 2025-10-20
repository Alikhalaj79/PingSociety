import { NextRequest, NextResponse } from "next/server";
import { apiService } from "@/services/api";

export async function GET() {
  try {
    console.log("🧪 Testing backend API connection...");

    // Test the actual send-otp endpoint with a dummy phone
    const response = await apiService.sendOtp({ phone: "09123456789" });

    console.log("🔗 Backend test response:", response);

    return NextResponse.json({
      success: true,
      message: "Backend API is working",
      response: response,
    });
  } catch (error) {
    console.error("💥 Backend API test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Backend API connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

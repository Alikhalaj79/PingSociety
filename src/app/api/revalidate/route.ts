import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * API route for admin to revalidate event cache
 * 
 * Usage:
 * POST /api/revalidate?secret=YOUR_SECRET&eventId=123
 * POST /api/revalidate?secret=YOUR_SECRET (revalidates all events)
 * 
 * Set REVALIDATE_SECRET in your environment variables
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get("secret");
    const eventId = searchParams.get("eventId");

    // Check secret key
    const expectedSecret = process.env.REVALIDATE_SECRET;
    if (!expectedSecret) {
      return NextResponse.json(
        { 
          success: false, 
          error: "REVALIDATE_SECRET environment variable is not set" 
        },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid secret" },
        { status: 401 }
      );
    }

    const revalidatedPaths: string[] = [];

    // Revalidate specific event by ID
    if (eventId) {
      const eventPath = `/api/event/${eventId}`;
      revalidatePath(eventPath);
      revalidatedPaths.push(eventPath);
    } 
    // Revalidate all event-related paths
    else {
      // Revalidate events list
      revalidatePath("/api/event");
      revalidatedPaths.push("/api/event");
      
      // Also revalidate the page that uses this API
      revalidatePath("/", "page");
      revalidatedPaths.push("/ (page)");
    }

    return NextResponse.json({
      success: true,
      message: "Cache revalidated successfully",
      revalidated: revalidatedPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error revalidating cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در revalidation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET method for easier testing (same security)
 */
export async function GET(request: NextRequest) {
  return POST(request);
}


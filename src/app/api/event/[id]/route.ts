import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await context.params; // 💡 مهم: باید await کنیم

  const backendUrl = `${API_CONFIG.BASE_URL}/event/${eventId}`;

  try {
    const response = await fetch(backendUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorData = await safeParseJson(response);
      return NextResponse.json(
        {
          success: false,
          error: errorData?.message || "خطا در دریافت اطلاعات رویداد",
        },
        { status: response.status }
      );
    }

    const data = await safeParseJson(response);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "پاسخ سرور نامعتبر است",
        },
        { status: 502 }
      );
    }

    const event = data.event || data.data || data;
    
    // Normalize paymentType field - support both camelCase and snake_case
    if (event && typeof event === "object") {
      event.paymentType = event.paymentType || event.payment_type;
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطای داخلی سرور یا عدم ارتباط با سرور",
      },
      { status: 500 }
    );
  }
}

async function safeParseJson(response: Response): Promise<any | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       cache: "no-store",
//     });

//     const text = await res.text();
//     let json: any = {};
//     try {
//       json = JSON.parse(text);
//     } catch {
//       return NextResponse.json(
//         { success: false, error: "پاسخ نامعتبر از سرور" },
//         { status: 502 }
//       );
//     }

//     if (!res.ok) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: json?.message || json?.error || "رویداد یافت نشد",
//         },
//         { status: res.status }
//       );
//     }

//     // Normalize the response - handle different response formats
//     const event = json?.event || json?.data || json;

//     return NextResponse.json({ success: true, event });
//   } catch (e) {
//     console.error("Error fetching event detail:", e);
//     return NextResponse.json(
//       { success: false, error: "خطا در ارتباط با سرور" },
//       { status: 500 }
//     );
//   }
// }

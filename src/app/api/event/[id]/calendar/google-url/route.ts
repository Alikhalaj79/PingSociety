import { NextResponse, type NextRequest } from "next/server";

// این روتر موقتاً غیرفعال است تا خطای «is not a module» در بیلد رفع شود.
// در صورت نیاز به فعال‌سازی، منطق تولید لینک گوگل‌کلندر را اینجا اضافه کنید.
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await context.params;
  return NextResponse.json(
    {
      message: "Google Calendar URL endpoint is currently disabled.",
      eventId,
    },
    { status: 410 }
  );
}

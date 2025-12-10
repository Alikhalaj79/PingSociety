import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    let bearer = accessToken || "";

    // If no access token, try refresh inline (best-effort)
    if (!bearer && refreshToken) {
      try {
        const refreshRes = await fetch(
          `${API_CONFIG.BASE_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: new URLSearchParams({ refreshToken }).toString(),
            cache: "no-store",
          }
        );
        const refreshText = await refreshRes.text();
        let refreshJson: Record<string, unknown> | null = null;
        try {
          refreshJson = JSON.parse(refreshText);
        } catch {
          refreshJson = null;
        }
        if (refreshRes.ok && refreshJson) {
          const atCandidate =
            (refreshJson as Record<string, unknown>)["access_token"] ??
            (refreshJson as Record<string, unknown>)["accessToken"] ??
            (refreshJson as Record<string, unknown>)["token"];
          if (typeof atCandidate === "string") {
            bearer = atCandidate;
          }
        }
      } catch {}
    }

    if (!bearer) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      `${API_CONFIG.BASE_URL}/order/${id}/cancel`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${bearer}`,
        },
        cache: "no-store",
      }
    );

    const text = await backendRes.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    return NextResponse.json(json as any, { status: backendRes.status });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}


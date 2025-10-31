import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    let bearer = accessToken || authToken || "";

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
        { success: false, error: "Unauthorized", message: "Login on your account" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const backendRes = await fetch(`${API_CONFIG.BASE_URL}/payment/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await backendRes.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    return NextResponse.json(json as any, { status: backendRes.status });
  } catch (e) {
    console.error("Payment initiate error:", e);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}


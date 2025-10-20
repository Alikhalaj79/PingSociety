import { NextRequest, NextResponse } from "next/server";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://pingsociety.liara.run";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    const token = accessToken || authToken;

    if (!token) {
      const refreshToken = request.cookies.get("refresh_token")?.value;
      if (refreshToken) {
        // Attempt refresh using refresh token value
        const backendUrl = `${BASE_URL}/auth/refresh-token`;
        const backendResponse = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: new URLSearchParams({ refreshToken }).toString(),
          cache: "no-store",
        });

        const backendText = await backendResponse.text();
        let backendJson: Record<string, unknown> | null = null;
        try {
          backendJson = JSON.parse(backendText);
        } catch {
          backendJson = null;
        }

        if (backendResponse.ok && backendJson) {
          // Prepare response payload and response
          const responsePayload: {
            isAuthenticated: boolean;
            user: unknown | null;
            refreshed: boolean;
          } = {
            isAuthenticated: true,
            user: null,
            refreshed: true,
          };
          const response = NextResponse.json(responsePayload);

          const atCandidate =
            (backendJson as Record<string, unknown>)["access_token"] ??
            (backendJson as Record<string, unknown>)["accessToken"] ??
            (backendJson as Record<string, unknown>)["token"];
          if (typeof atCandidate === "string") {
            response.cookies.set("access_token", atCandidate, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60,
            });
            // Try fetching user with the fresh access token and include in response
            try {
              const meRes = await fetch(`${BASE_URL}/users/me`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${atCandidate}`,
                },
                cache: "no-store",
              });
              if (meRes.ok) {
                responsePayload.user = await meRes.json();
              }
            } catch {}
          }

          const rtCandidate =
            (backendJson as Record<string, unknown>)["refresh_token"] ??
            (backendJson as Record<string, unknown>)["refreshToken"];
          if (typeof rtCandidate === "string") {
            response.cookies.set("refresh_token", rtCandidate, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
            });
          }

          // Return early with cookies set and optional user
          return response;
        } else if (backendResponse.status === 401) {
          // Refresh invalid → clear cookies
          const response = NextResponse.json(
            { isAuthenticated: false, user: null, requiresLogin: true },
            { status: 401 }
          );
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");
          return response;
        }
      }
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      );
    }

    // Validate token with backend
    const backendRes = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!backendRes.ok) {
      // If backend rejects access token but we have a refresh token, try refresh inline
      const refreshToken = request.cookies.get("refresh_token")?.value;
      if (refreshToken) {
        const backendUrl = `${BASE_URL}/auth/refresh-token`;
        const backendResponse = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: new URLSearchParams({ refreshToken }).toString(),
          cache: "no-store",
        });

        const backendText = await backendResponse.text();
        let backendJson: Record<string, unknown> | null = null;
        try {
          backendJson = JSON.parse(backendText);
        } catch {
          backendJson = null;
        }

        if (backendResponse.ok && backendJson) {
          const responsePayload: {
            isAuthenticated: boolean;
            user: unknown | null;
            refreshed: boolean;
          } = {
            isAuthenticated: true,
            user: null,
            refreshed: true,
          };
          const response = NextResponse.json(responsePayload);

          const atCandidate2 =
            (backendJson as Record<string, unknown>)["access_token"] ??
            (backendJson as Record<string, unknown>)["accessToken"] ??
            (backendJson as Record<string, unknown>)["token"];
          if (typeof atCandidate2 === "string") {
            response.cookies.set("access_token", atCandidate2, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60,
            });
            // Try fetching user with the fresh access token and include in response
            try {
              const meRes = await fetch(`${BASE_URL}/users/me`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${atCandidate2}`,
                },
                cache: "no-store",
              });
              if (meRes.ok) {
                responsePayload.user = await meRes.json();
              }
            } catch {}
          }

          const rtCandidate2 =
            (backendJson as Record<string, unknown>)["refresh_token"] ??
            (backendJson as Record<string, unknown>)["refreshToken"];
          if (typeof rtCandidate2 === "string") {
            response.cookies.set("refresh_token", rtCandidate2, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
            });
          }

          return response;
        } else if (backendResponse.status === 401) {
          const response = NextResponse.json(
            { isAuthenticated: false, user: null, requiresLogin: true },
            { status: 401 }
          );
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");
          return response;
        }
      }
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      );
    }

    const user = await backendRes.json();
    return NextResponse.json({ isAuthenticated: true, user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { isAuthenticated: false, user: null },
      { status: 200 }
    );
  }
}

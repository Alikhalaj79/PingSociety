import { API_CONFIG, API_ENDPOINTS } from "@/config/api";

// Server-side auth functions
export async function getServerSideAuth(context: {
  req: {
    cookies: { access_token?: string; auth_token?: string };
    headers: { authorization?: string };
  };
}) {
  const { req } = context;
  const accessToken = req.cookies.access_token;
  const authToken = req.cookies.auth_token;
  const headerToken = req.headers.authorization?.replace("Bearer ", "");

  const token = accessToken || authToken || headerToken;

  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }

  try {
    // Call backend API directly from server-side
    const backendUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_ME}`;
    console.log("🔍 Server-side auth: Calling backend URL:", backendUrl);
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Add timeout and cache settings for server-side fetch
      cache: "no-store",
      next: { revalidate: 0 },
      // Add signal for timeout handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log("🔍 Server-side auth: Response status:", response.status);
    
    if (response.ok) {
      const userData = await response.json();
      console.log("✅ Server-side auth: User authenticated successfully");
      return {
        isAuthenticated: true,
        user: userData,
        token,
      };
    } else {
      console.error("❌ Server-side auth: Backend returned error status:", response.status);
      const errorText = await response.text();
      console.error("❌ Server-side auth: Error response:", errorText);
    }
  } catch (error) {
    // Log the error with more details
    console.error("💥 Server-side auth error:", error);
    if (error instanceof Error) {
      console.error("💥 Error name:", error.name);
      console.error("💥 Error message:", error.message);
      if (error.cause) {
        console.error("💥 Error cause:", error.cause);
      }
    }
    
    // If it's a fetch error, it might be a network/connectivity issue
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("💥 This looks like a network connectivity issue.");
      console.error("💥 Check if the backend is accessible from the server.");
      console.error("💥 Backend URL should be:", `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_ME}`);
    }
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
}

// Client-side auth functions
export function getClientSideAuth() {
  // In cookies-only mode, rely on server endpoints instead of localStorage
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://pingsociety.liara.run";

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
    // Verify token with your API using the correct endpoint
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        isAuthenticated: true,
        user: userData,
        token,
      };
    }
  } catch (error) {
    console.error("Server-side auth error:", error);
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

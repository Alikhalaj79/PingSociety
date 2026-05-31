// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.pingsociety.ir",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  SEND_OTP: "/auth/send-otp",
  VERIFY_OTP: "/auth/verify-otp",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",

  // User endpoints
  USER_ME: "/users/me",
  USER_PROFILE: "/users/profile",
  USER_UPDATE: "/users/:id",
  USER_ORDERS: "/users/orders",
  USER_TICKETS: "/users/tickets",

  // Events endpoints
  EVENTS: "/events",
  EVENT_DETAIL: "/events/:id",

  // Tickets endpoints
  TICKETS: "/tickets",
  PURCHASE_TICKET: "/tickets/purchase",
} as const;

// Environment configuration
export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "https//:api.pingsociety.ir",
} as const;

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getFullEndpoint = (
  endpoint: string,
  params?: Record<string, string>,
): string => {
  let url = getApiUrl(endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  return url;
};

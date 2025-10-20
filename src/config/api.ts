// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://pingsociety.liara.run", // Remove /api from base URL
  TIMEOUT: 10000, // 10 seconds
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints (only these exist in backend)
  SEND_OTP: "/auth/send-otp",
  VERIFY_OTP: "/auth/verify-otp",

  // User endpoints (if they exist)
  PROFILE: "/users/me",
  UPDATE_PROFILE: "/users/update",

  // Events endpoints (if they exist)
  EVENTS: "/events",
  EVENT_DETAIL: "/events/:id",

  // Tickets endpoints (if they exist)
  TICKETS: "/tickets",
  PURCHASE_TICKET: "/tickets/purchase",
} as const;

// Environment configuration
export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

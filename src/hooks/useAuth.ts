"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
import toast from "react-hot-toast";

interface User {
  id: number;
  phone: string;
  fullname?: string;
  email?: string;
  company?: string;
  fieldOfActivity?: string;
  source?: string;
  role: string;
  created_at: string;
  updated_at: string;
  moderatedEvents: unknown[];
  tickets: unknown[];
  orders: unknown[];
  payments: unknown[];
  sponsor?: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use Next.js API route to avoid CORS issues
      const response = await fetch("/api/auth/check-auth", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          setAuthState({
            isAuthenticated: true,
            user: data.user,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } else if (response.status === 401) {
        // Token missing/invalid but refresh may exist; try refresh
        console.log("🔄 Attempting token refresh...");
        const refreshResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        if (refreshResponse.ok) {
          console.log("✅ Token refreshed, re-checking auth");
          await checkAuth();
          return;
        }
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: "Token refresh failed",
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: "Authentication failed",
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: "Network error",
      });
    }
  }, []);

  const attemptTokenRefresh = useCallback(async () => {
    try {
      const refreshResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.isAuthenticated) {
          console.log("✅ Token refreshed successfully");
          // Retry the original auth check
          await checkAuth();
        } else {
          console.log("❌ Token refresh failed");
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: "Token refresh failed",
          });
        }
      } else {
        console.log(
          "❌ Token refresh failed with status:",
          refreshResponse.status
        );
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: "Token refresh failed",
        });
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: "Token refresh error",
      });
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      // Use Next.js API route to avoid CORS issues
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
      // Notify app and re-check to update header immediately
      try {
        window.dispatchEvent(new Event("auth:changed"));
      } catch {}

      // Show logout toast
      toast("شما از حساب کاربری خود خارج شدید", {
        icon: "👋",
        style: {
          background: "#1a1a2e",
          color: "#fff",
          border: "1px solid #6b7280",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#6b7280",
          secondary: "#fff",
        },
      });

      checkAuth();
    }
  }, [checkAuth]);

  useEffect(() => {
    // Skip checkAuth on OTP page - user is in the process of authenticating
    if (pathname !== "/otp") {
      checkAuth();
    }
  }, [checkAuth, pathname]);

  // Re-check auth on route changes (except OTP page)
  useEffect(() => {
    // Skip checkAuth on OTP page - user is in the process of authenticating
    if (pathname !== "/otp") {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Re-check when the tab gains focus or a global auth event occurs
  useEffect(() => {
    const onFocus = () => {
      if (pathname !== "/otp") {
        checkAuth();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && pathname !== "/otp") {
        checkAuth();
      }
    };
    const onAuthChanged = () => {
      if (pathname !== "/otp") {
        checkAuth();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("auth:changed", onAuthChanged as EventListener);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(
        "auth:changed",
        onAuthChanged as EventListener
      );
    };
  }, [checkAuth, pathname]);

  return {
    ...authState,
    checkAuth,
    logout,
    refreshToken: attemptTokenRefresh,
  };
}

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService, SendOtpRequest } from "@/services/api";

// Types
export interface User {
  id: string;
  phone: string;
  name?: string;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Initial state
const initialState: AuthState = {
  isLoading: false,
  error: null,
  isAuthenticated: false,
  user: null,
  token: null,
};

// Async thunks
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (phone: string, { rejectWithValue }) => {
    try {
      const request: SendOtpRequest = { phone };
      const response = await apiService.sendOtp(request);

      if (response.success) {
        return { message: response.message };
      } else {
        return rejectWithValue(response.error || "خطا در ارسال کد تایید");
      }
    } catch {
      return rejectWithValue("خطا در ارتباط با سرور");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    { phone, otp, otpId }: { phone: string; otp: string; otpId?: string },
    { rejectWithValue }
  ) => {
    try {
      // Route through Next.js API to set httpOnly cookies
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp, otpId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        return rejectWithValue(data?.error || "کد تایید نامعتبر است");
      }

      // Cookies are set by the API route; we only keep user in state
      const user = data.user || null;
      return { token: null, user, message: data.message };
    } catch {
      return rejectWithValue("خطا در ارتباط با سرور");
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Check auth via server API using cookies
      const res = await fetch("/api/user/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        return rejectWithValue("Auth check failed");
      }

      const data = await res.json();
      if (data?.isAuthenticated) {
        return { token: null, user: data.user };
      }

      return rejectWithValue("Not authenticated");
    } catch {
      return rejectWithValue("Invalid stored auth data");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      // State-only reset; cookies are cleared via /api/auth/logout
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Initialize Auth
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(initializeAuth.rejected, (state) => {
        // Don't set error for initialization failure
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

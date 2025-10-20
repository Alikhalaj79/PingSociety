import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendOtp,
  verifyOtp,
  initializeAuth,
  clearError,
  logout,
  User,
} from "@/store/slices/authSlice";

export const useAuthRTK = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const handleSendOtp = useCallback(
    async (phone: string) => {
      const result = await dispatch(sendOtp(phone));
      return {
        success: result.type.endsWith("fulfilled"),
        message: result.type.endsWith("fulfilled")
          ? "کد تایید ارسال شد"
          : undefined,
        error: result.type.endsWith("rejected")
          ? (result.payload as string)
          : undefined,
      };
    },
    [dispatch]
  );

  const handleVerifyOtp = useCallback(
    async (phone: string, otp: string, otpId?: string) => {
      const result = await dispatch(verifyOtp({ phone, otp, otpId }));
      if (result.type.endsWith("fulfilled")) {
        const payload = result.payload as {
          token: string;
          user: User;
          message: string;
        };
        return {
          success: true,
          message: payload.message,
          user: payload.user,
          token: payload.token,
        };
      } else {
        return {
          success: false,
          error: result.payload as string,
        };
      }
    },
    [dispatch]
  );

  const handleInitializeAuth = useCallback(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...authState,
    sendOtp: handleSendOtp,
    verifyOtp: handleVerifyOtp,
    initializeAuth: handleInitializeAuth,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

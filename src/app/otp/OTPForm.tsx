"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/Container";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function OTPForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState(""); // For development testing
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const phone = searchParams.get("phone");
    if (phone) {
      setPhoneNumber(phone);
    } else {
      // If no phone number, redirect to register page
      router.push("/register");
    }
  }, [searchParams, router]);
  
  const returnTo = searchParams.get("returnTo");

  // Get OTP code from localStorage for development
  useEffect(() => {
    const storedOtp = localStorage.getItem("dev_otp_code");
    if (storedOtp) {
      setDevOtpCode(storedOtp);
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Remove non-digits

    if (pastedData.length === 6) {
      const otpArray = pastedData.split("");
      setOtp(otpArray);
      // Focus the last input
      const lastInput = document.getElementById(`otp-5`);
      lastInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("لطفاً کد ۶ رقمی را کامل وارد کنید");
      return;
    }

    if (!phoneNumber) {
      setError("شماره موبایل یافت نشد");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Prepare request data
      const requestData = { phone: phoneNumber, otp: otpValue };

      // Log what we're sending
      console.log("Sending OTP verification request:", requestData);
      console.log(
        "Request URL:",
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VERIFY_OTP}`
      );

      // Use Next.js proxy route to avoid CORS issues
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (parseError) {
        console.log("Response is not JSON, getting text:", parseError);
        const textData = await response.text();
        console.log("Response text:", textData);
        data = { error: "Invalid response format from server" };
      }

      if (response.ok && data.success) {
        // Cookies are automatically set by the Next.js proxy route
        // No need to manually store tokens in localStorage

        // Successfully verified, update auth state and redirect to dashboard
        // Dispatch auth:changed event to notify other components
        try {
          window.dispatchEvent(new Event("auth:changed"));
        } catch {}

        // Check auth status once to update state
        await checkAuth();

        // Show success toast with green background
        toast.success("وارد حساب کاربری شدید", {
          style: {
            background: "#065f46",
            color: "#fff",
            border: "1px solid #10b981",
            borderRadius: "8px",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        });

        // Redirect to returnTo if exists, otherwise to home page
        if (returnTo) {
          router.push(decodeURIComponent(returnTo));
        } else {
          router.push("/");
        }
      } else {
        setError(data.message || data.error || "کد تایید نامعتبر است");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) {
      setError("شماره موبایل یافت نشد");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SEND_OTP}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone: phoneNumber }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear OTP inputs
        setOtp(["", "", "", "", "", ""]);
      } else {
        setError(data.message || data.error || "خطا در ارسال مجدد کد");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    router.push("/register");
  };

  const handleAutoFillOtp = () => {
    if (devOtpCode && devOtpCode.length === 6) {
      const otpArray = devOtpCode.split("");
      setOtp(otpArray);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C22] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                تایید شماره موبایل
              </h1>
              <p className="text-white/80 text-sm mb-2">
                کد ۶ رقمی ارسال شده به شماره موبایل خود را وارد کنید
              </p>
              {phoneNumber && (
                <p className="text-[#F84920] font-medium text-sm">
                  {phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")}
                </p>
              )}

              {/* Development OTP Code Display */}
              {devOtpCode && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium mb-2">
                    🧪 کد تایید برای تست:
                  </p>
                  <p className="text-yellow-300 text-lg font-bold font-mono">
                    {devOtpCode}
                  </p>
                  <button
                    onClick={handleAutoFillOtp}
                    className="mt-2 px-3 py-1 bg-yellow-500/30 text-yellow-300 text-xs rounded hover:bg-yellow-500/40 transition-colors"
                  >
                    Auto Fill
                  </button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Paste instruction */}
              <p className="text-white/70 text-sm text-center mb-2">
                کد ۶ رقمی را وارد کنید یا در اولین فیلد paste کنید
              </p>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-2xl font-bold bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full bg-[#F84920] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#e63e1a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "در حال تایید..." : "تایید کد"}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm underline disabled:opacity-50"
                >
                  ارسال مجدد کد
                </button>
              </div>
            </form>

            {/* Back to Register */}
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToRegister}
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
              >
                تغییر شماره موبایل
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

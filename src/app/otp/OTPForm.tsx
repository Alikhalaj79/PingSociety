"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

declare global {
  interface Window {
    OTPCredential?: unknown;
  }
}

function OTPContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
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

  // Web OTP API (Android Chrome): auto-read SMS sent to this device and submit
  useEffect(() => {
    if (!phoneNumber) return;
    // Guard unsupported browsers/contexts (must be HTTPS + same device)
    if (!("OTPCredential" in window)) return;

    const abortController = new AbortController();

    const listenForOtp = async () => {
      try {
        const otpCredential = (await navigator.credentials.get({
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        } as CredentialRequestOptions & {
          otp: { transport: string[] };
        })) as { code?: string } | null;

        const code = otpCredential?.code?.replace(/\D/g, "");
        if (code && code.length >= 6) {
          const digits = code.slice(0, 6).split("");
          setOtp(digits);

          // Focus last field for visual feedback
          const lastInput = document.getElementById("otp-5");
          lastInput?.focus();

          // Auto-submit when filled
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        }
      } catch (err) {
        // Silence aborts; log unexpected errors for debugging
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.warn("Web OTP autofill failed:", err);
        }
      }
    };

    listenForOtp();

    return () => abortController.abort();
  }, [phoneNumber]);

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

  return (
    <div className="min-h-screen bg-[#080358] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center">
        {/* Development OTP display disabled (SMS-only flow) */}

        <div className="bg-[#080358]/60 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] p-10 border border-white/30 w-[400px] h-[400px] flex flex-col items-center justify-center">
          {/* Header */}
          <div className="text-center flex flex-col items-center mb-4">
            <h1 className="text-5xl font-bold text-white mb-1 w-[218px] h-[60px] flex items-center justify-center mx-auto">
              تایید شماره
            </h1>
            {phoneNumber && (
              <p className="text-[#F84920] font-medium text-sm mb-2">
                {phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")}
              </p>
            )}
            <p className="text-white font-medium text-lg ">
              کد ۶ رقمی ارسال شده را وارد کنید
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <p className="text-sm text-red-400 text-center mb-2">{error}</p>
          )}

          {/* OTP Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-4 w-full"
          >
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3">
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
                  className="w-[35px] h-[50px] text-center text-xl font-bold text-black bg-white rounded-[15px] focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200 mx-0.5"
                  style={{
                    boxShadow: " 5px 5px 5px 0px rgba(0, 0, 0, 0.5) inset",
                  }}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="w-full flex justify-center">
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="bg-gradient-to-b from-[#F84920] to-[#922E13] text-white w-[150px] h-[50px] rounded-2xl font-semibold hover:from-[#FF6B40] hover:to-[#B03318] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg text-lg flex items-center justify-center mt-2"
              >
                {isLoading ? "در حال تایید..." : "تایید کد"}
              </button>
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-white hover:text-white transition-colors duration-200 text-sm disabled:opacity-50 hover:cursor-pointer flex items-center justify-center gap-1"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "12px" }}
                >
                  autorenew
                </span>
                ارسال مجدد کد
              </button>
            </div>
          </form>

          {/* Back to Register */}
          <div className="mt-4 text-center">
            <button
              onClick={handleBackToRegister}
              className="text-white hover:text-white transition-colors duration-200 text-sm hover:cursor-pointer"
            >
              تغییر شماره موبایل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OTPForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080358] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F84920] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white">
              در حال بارگذاری...
            </h2>
            <p className="text-white/80 text-sm">لطفا صبر کنید</p>
          </div>
        </div>
      }
    >
      <OTPContent />
    </Suspense>
  );
}

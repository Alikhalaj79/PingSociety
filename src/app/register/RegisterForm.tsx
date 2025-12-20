"use client";

import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
// No need for React Query - using Next.js API routes

// کامپوننت داخلی: کل منطق و UI رو اینجا می‌ذاریم (فقط در کلاینت رندر می‌شه)
function RegisterFormContent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters to get only digits
    const digitsOnly = e.target.value.replace(/\D/g, "");

    // Limit to 11 digits total - no automatic prefix
    if (digitsOnly.length <= 11) {
      setPhoneNumber(digitsOnly);
      setError("");

      // Set cursor position after value updates (accounting for spaces in formatted display)
      setTimeout(() => {
        if (inputRef.current) {
          // Calculate cursor position: each digit + space, last digit without trailing space
          // Example: "0 9 1" -> position after last digit (position 5)
          const cursorPos =
            digitsOnly.length > 0 ? digitsOnly.length * 2 - 1 : 0;
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  };

  // Format display value: digits with spaces + placeholders to fill 11 digits
  const getDisplayValue = () => {
    if (!phoneNumber || phoneNumber.length === 0) {
      return "";
    }

    // Format entered digits with spaces: "0 9 1 2 3"
    const formattedDigits = phoneNumber.split("").join(" ");

    // Calculate remaining digits to reach 11
    const remainingDigits = 11 - phoneNumber.length;

    // Format placeholders with spaces: "- - - -"
    const formattedPlaceholders =
      remainingDigits > 0 ? " " + "- ".repeat(remainingDigits).trim() : "";

    return `${formattedDigits}${formattedPlaceholders}`;
  };

  const validatePhoneNumber = (phone: string) => {
    if (!phone) {
      return "شماره موبایل الزامی است";
    }
    if (phone.length !== 11) {
      return "شماره موبایل باید ۱۱ رقم باشد";
    }
    if (!phone.startsWith("09")) {
      return "شماره موبایل باید با ۰۹ شروع شود";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePhoneNumber(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    setIsLoading(true);
    setError("");

    try {
      // Call backend API directly
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

      // Log the response to see what we're getting from backend
      console.log("Backend response:", data);
      console.log("Response status:", response.status);

      // Check if response is successful (200 or 204)
      if (response.ok && (response.status === 200 || response.status === 204)) {
        // Store OTP code in localStorage for development testing (if available)
        // Check different possible field names for OTP code
        const otpCode =
          data.otp || data.code || data.otp_code || data.verification_code;

        if (otpCode) {
          localStorage.setItem("dev_otp_code", otpCode);
          console.log("OTP code stored:", otpCode);
        } else {
          console.log(
            "No OTP code found in response. Available fields:",
            Object.keys(data)
          );
        }

        // Always navigate to OTP page when phone number is sent successfully
        // Preserve returnTo if it exists
        const otpUrl = returnTo
          ? `/otp?phone=${encodeURIComponent(
              phoneNumber
            )}&returnTo=${encodeURIComponent(returnTo)}`
          : `/otp?phone=${encodeURIComponent(phoneNumber)}`;
        router.push(otpUrl);
      } else {
        setError(data.message || data.error || "خطا در ارسال کد تایید");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080358] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg mx-auto flex items-center justify-center">
        <div className="bg-[#080358]/60 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] p-10 border border-white/30 w-[400px] h-[400px] flex flex-col items-center justify-center">
          {/* Header */}
          <div className="text-center flex flex-col items-center mb-4">
            <h1 className="text-5xl font-bold text-white mb-7 w-[218px] h-[60px] flex items-center justify-center mx-auto">
              ورود | ثبت نام
            </h1>
            <p className="text-white font-bold text-lg mb-4">
              شماره همراه خود را وارد کنید تا کد تایید ارسال شود
            </p>
          </div>

          {/* Phone Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-10"
          >
            {/* Phone Input */}
            <div className="w-full flex justify-center">
              <input
                ref={inputRef}
                id="phone"
                type="tel"
                value={getDisplayValue()}
                onChange={handlePhoneChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  !isFocused && (!phoneNumber || phoneNumber.length === 0)
                    ? "0 9 - - - - - - - - -"
                    : ""
                }
                className={`w-[300px] px-1 py-3 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200 text-left text-xl font-medium tracking-wider ${
                  isFocused
                    ? "text-black placeholder:text-black"
                    : "text-gray-500 placeholder:text-gray-400"
                }`}
                dir="ltr"
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  boxShadow: " 5px 5px 5px 0px rgba(0, 0, 0, 0.5) inset",
                }}
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {/* Submit Button */}
            <div className="w-full flex justify-center ">
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 11}
                className="bg-gradient-to-b from-[#F84920] to-[#922E13] text-white w-[150px] h-[50px] rounded-2xl font-semibold hover:from-[#FF6B40] hover:to-[#B03318] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg text-lg flex items-center justify-center"
              >
                {isLoading ? "در حال ارسال..." : "ارسال کد تایید"}
              </button>
            </div>
          </form>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-white hover:text-white transition-colors duration-200 text-sm"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default: کامپوننت اصلی که با Suspense wrap شده (برای حل مشکل build)
export default function RegisterForm() {
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
      <RegisterFormContent />
    </Suspense>
  );
}

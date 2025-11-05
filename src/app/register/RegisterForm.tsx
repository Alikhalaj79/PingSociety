"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { API_CONFIG, API_ENDPOINTS } from "@/config/api";
// No need for React Query - using Next.js API routes

export default function RegisterForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 11) {
      setPhoneNumber(value);
      setError("");
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 11 && phone.startsWith("09")) {
      return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }
    return phone;
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
          ? `/otp?phone=${encodeURIComponent(phoneNumber)}&returnTo=${encodeURIComponent(returnTo)}`
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
    <div className="min-h-screen bg-[#0C0C22] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                ورود / ثبت نام
              </h1>
              <p className="text-white/80 text-sm">
                شماره موبایل خود را وارد کنید تا کد تایید برای شما ارسال شود
              </p>
            </div>

            {/* Phone Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-white/90 mb-2 text-right"
                >
                  شماره موبایل
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder="0912 345 6789"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200 text-right"
                  dir="ltr"
                />
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 11}
                className="w-full bg-[#F84920] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#e63e1a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "در حال ارسال..." : "ارسال کد تایید"}
              </button>
            </form>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

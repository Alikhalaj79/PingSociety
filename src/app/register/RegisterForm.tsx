"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
// No need for React Query - using Next.js API routes

export default function RegisterForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      // Call Next.js API route
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        // Store OTP code in localStorage for development testing
        if (data.backendResponse?.otp) {
          localStorage.setItem("dev_otp_code", data.backendResponse.otp);
        }

        // Navigate to OTP page with phone number
        router.push(`/otp?phone=${encodeURIComponent(phoneNumber)}`);
      } else {
        setError(data.error || "خطا در ارسال کد تایید");
      }
    } catch (_error) {
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

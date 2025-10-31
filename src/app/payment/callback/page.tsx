"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Footer from "@/components/homePage/Footer";
import toast from "react-hot-toast";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from URL (Zarinpal sends Authority and Status in query string)
        const authority = searchParams.get("Authority");
        const statusParam = searchParams.get("Status");

        if (!authority) {
          setStatus("error");
          setMessage("اطلاعات پرداخت یافت نشد");
          toast.error("اطلاعات پرداخت یافت نشد");
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
          return;
        }

        // Call callback API (GET endpoint - public, called by Zarinpal)
        const response = await fetch(
          `/api/payment/callback?Authority=${authority}&Status=${statusParam || ""}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("Payment verify response:", data);

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "پرداخت با موفقیت انجام شد");
          toast.success(data.message || "پرداخت با موفقیت انجام شد");
          
          // Dispatch event to refresh dashboard data (tickets and orders)
          try {
            window.dispatchEvent(new Event("refresh-dashboard"));
          } catch {}
          
          setTimeout(() => {
            router.push("/dashboard?tab=overview");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            data.error || data.message || "پرداخت ناموفق بود یا لغو شد"
          );
          toast.error(data.error || data.message || "پرداخت ناموفق بود");
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      } catch (error) {
        console.error("Payment verify error:", error);
        setStatus("error");
        setMessage("خطا در بررسی وضعیت پرداخت");
        toast.error("خطا در بررسی وضعیت پرداخت");
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="py-20">
        <Container>
          <div className="max-w-md mx-auto text-center">
            {status === "loading" && (
              <div className="space-y-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F84920] mx-auto"></div>
                <h2 className="text-2xl font-bold">در حال بررسی پرداخت...</h2>
                <p className="text-gray-400">لطفا صبر کنید</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6 bg-green-500/10 border border-green-500/30 rounded-lg p-8">
                <svg
                  className="w-16 h-16 mx-auto text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-green-300">
                  پرداخت موفق
                </h2>
                <p className="text-gray-300">{message}</p>
                <p className="text-sm text-gray-400">
                  در حال انتقال به داشبورد...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6 bg-red-500/10 border border-red-500/30 rounded-lg p-8">
                <svg
                  className="w-16 h-16 mx-auto text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-red-300">
                  پرداخت ناموفق
                </h2>
                <p className="text-gray-300">{message}</p>
                <p className="text-sm text-gray-400">
                  در حال انتقال به داشبورد...
                </p>
              </div>
            )}
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}


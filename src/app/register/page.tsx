"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      if (isAuthenticated) {
        // Redirect to returnTo if exists, otherwise to dashboard
        if (returnTo) {
          router.push(decodeURIComponent(returnTo));
        } else {
          router.push("/");
        }
      }
    }
  }, [isAuthenticated, isLoading, router, returnTo]);

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-[#0C0C22] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F84920]"></div>
          <p className="text-white/80 text-sm">در حال بررسی وضعیت...</p>
        </div>
      </div>
    );
  }

  return <RegisterForm />;
}

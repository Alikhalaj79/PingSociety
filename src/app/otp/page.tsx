import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getClientSideAuth } from "@/lib/auth";
import OTPForm from "./OTPForm";

// Server Component
export default async function OTPPage() {
  // Check if user is already authenticated
  const auth = getClientSideAuth();

  if (auth.isAuthenticated) {
    redirect("/");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPForm />
    </Suspense>
  );
}

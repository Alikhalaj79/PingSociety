import { redirect } from "next/navigation";
import { getClientSideAuth } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

// Server Component
export default async function RegisterPage() {
  // Check if user is already authenticated
  const auth = getClientSideAuth();

  if (auth.isAuthenticated) {
    redirect("/");
  }

  return <RegisterForm />;
}

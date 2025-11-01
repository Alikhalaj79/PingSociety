import { Suspense } from "react";
import { getServerSideAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import UserDashboard from "./UserDashboard";
import DashboardSkeleton from "./components/DashboardSkeleton";

// Server-side authentication check
export default async function DashboardPage() {
  // Get cookies for server-side auth check
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const authToken = cookieStore.get("auth_token")?.value;

  // Check authentication on server-side
  const auth = await getServerSideAuth({
    req: {
      cookies: {
        access_token: accessToken,
        auth_token: authToken,
      },
      headers: {},
    },
  });

  // Redirect if not authenticated
  if (!auth.isAuthenticated) {
    redirect("/register");
  }

  return (
    <div className="min-h-screen bg-[#0C0C22]">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0C0C22] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F84920]"></div>
              <p className="text-white/80 text-sm">در حال بارگذاری...</p>
            </div>
          </div>
        }
      >
        <UserDashboard initialUser={auth.user} />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "پنل کاربری - PingSociety",
    description: "مدیریت حساب کاربری، بلیط‌ها و سفارشات",
    robots: "noindex, nofollow", // Private page
  };
}

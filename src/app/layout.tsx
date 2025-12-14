import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthInitializer } from "@/components/AuthInitializer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "PingSociety | دورهمی بچه های Tech",
  description:
    "کامیونیتی تخصصی برای علاقه مندان و فعالان حوزه فناوری. هدف ما ایجاد بستری برای شبکه سازی، به اشتراک گذاری تجربه ها و کشف فرصتهای جدید در جامعهی تکنولوژی است.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased">
        <ReduxProvider>
          <AuthProvider>
            <AuthInitializer />
            {children}
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#1a1a2e",
                  color: "#fff",
                  border: "1px solid #F84920",
                  borderRadius: "8px",
                },
                success: {
                  duration: 3000,
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
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
